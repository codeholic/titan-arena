import { sha512 } from '@noble/hashes/sha512';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { NextApiRequest } from 'next';
import handleJsonResponse from './handleJsonResponse';
import { RequestTransactionParams, RequestTransactionResult } from './types';

export type RequestTransactionHandlerArgs<TPayload> = {
    connection: Connection;
    payload: TPayload;
    prisma: PrismaClient;
    signer: PublicKey;
    timestamp: number;
};

const handleRequestTransaction = <TPayload>(
    handler: (_args: RequestTransactionHandlerArgs<TPayload>) => Promise<Transaction>
) =>
    handleJsonResponse(async (req: NextApiRequest, prisma: PrismaClient) => {
        const { signer: signerAddress, payload }: RequestTransactionParams<TPayload> = req.body;

        const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);
        const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
        const signer = new PublicKey(signerAddress);
        const timestamp = new Date().valueOf();

        const transaction = await handler({ connection, prisma, payload, signer, timestamp });
        transaction.feePayer = signer;

        const { blockhash } = await connection.getLatestBlockhash('finalized');

        transaction.recentBlockhash = blockhash;

        const transactionMessage = transaction.serializeMessage().toString('base64');
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

        return [200, { transactionMessage, checksum, timestamp } as RequestTransactionResult];
    });

export default handleRequestTransaction;
