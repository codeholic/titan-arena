import { sha512 } from '@noble/hashes/sha512';
import { PrismaClient } from '@prisma/client';
import { Connection, Keypair, Message, Transaction } from '@solana/web3.js';
import { sign } from './utils';
import { NextApiRequest } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import handleJsonResponse, { HandlerResult } from './handleJsonResponse';
import { ExecuteTransactionHandler, ExecuteTransactionParams } from './types';

type HandleExecuteTransactionArgs<TPayload> = {
    handler: 'claimQuest';
    validateAndLock: ExecuteTransactionHandler<TPayload>;
    unlock: ExecuteTransactionHandler<TPayload>;
    signByAuthority: Boolean;
};

const handleExecuteTransaction = <TPayload>({
    handler,
    validateAndLock,
    unlock,
    signByAuthority,
}: HandleExecuteTransactionArgs<TPayload>) =>
    handleJsonResponse(async (req: NextApiRequest, prisma: PrismaClient) => {
        const params: ExecuteTransactionParams<TPayload> = req.body;
        const { payload, timestamp, transactionMessage } = params;

        const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;

        const checksum = Buffer.from(
            sha512(
                JSON.stringify({
                    transactionMessage,
                    payload,
                    timestamp,
                    salt,
                })
            )
        ).toString('base64');

        if (checksum !== params.checksum) {
            throw new ApiError(400, 'Wrong checksum.');
        }

        const transaction = Transaction.populate(Message.from(Buffer.from(transactionMessage, 'base64')), []);

        if (!transaction.feePayer) {
            throw new ApiError(400, 'Invalid transaction.');
        }

        const signer = transaction.feePayer;

        const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

        return prisma
            .$transaction((tx) => validateAndLock({ connection, prisma: tx, payload, signer, timestamp }))
            .then(async () => {
                transaction.addSignature(signer, Buffer.from(params.signature, 'base64'));

                if (signByAuthority) {
                    const authority = Keypair.fromSecretKey(
                        new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!))
                    );

                    transaction.addSignature(
                        authority.publicKey,
                        Buffer.from(sign(Buffer.from(transactionMessage, 'base64'), authority.secretKey))
                    );
                }

                const signature = await connection.sendRawTransaction(transaction.serialize());
                const latestBlockhash = await connection.getLatestBlockhash();

                const {
                    value: { err },
                } = await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

                await prisma.$connect();

                if (err) {
                    await prisma.$transaction((tx) => unlock({ connection, payload, prisma: tx, signer, timestamp }));

                    throw new ApiError(500, 'Internal server error.');
                }

                await prisma.$connect();

                return prisma.job
                    .create({
                        data: {
                            signature,
                            handler,
                            payload: JSON.stringify(payload),
                            signer: signer.toBase58(),
                            timestamp: new Date(timestamp),
                        },
                    })
                    .then(() => [200, {}]);
            }) as HandlerResult;
    });

export default handleExecuteTransaction;
