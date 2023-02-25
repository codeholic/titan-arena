import { sha512 } from '@noble/hashes/sha512';
import { PrismaClient } from '@prisma/client';
import { Connection, Keypair, Message, PublicKey, Transaction } from '@solana/web3.js';
import { NextApiRequest } from 'next';
import { ApiError } from 'next/dist/server/api-utils';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';

interface ClaimTicketsParams {
    checksum: string;
    raffleId: number;
    ticketCount: number;
    signature: string;
    transactionMessage: string;
}

const handler = async (req: NextApiRequest, prisma: PrismaClient): HandlerResult => {
    const params: ClaimTicketsParams = req.body;
    const { raffleId, ticketCount, transactionMessage } = params;

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;

    const checksum = Buffer.from(
        sha512(
            JSON.stringify({
                transactionMessage,
                raffleId,
                ticketCount,
                salt,
            })
        )
    ).toString('base64');

    if (checksum !== params.checksum) {
        throw new ApiError(400, 'Wrong checksum.');
    }

    const solanaTx = Transaction.populate(Message.from(Buffer.from(transactionMessage, 'base64')), []);

    if (!solanaTx.feePayer) {
        throw new ApiError(400, 'Invalid transaction.');
    }

    const owner: PublicKey = solanaTx.feePayer!;
    const buyer = owner.toBase58();

    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

    return (
        prisma
            .$transaction(async (tx) => {
                const raffle = await tx.raffle.findUnique({
                    where: { id: raffleId },
                    include: { batches: { where: { buyer } } },
                });

                if (!raffle) {
                    throw new ApiError(400, 'Unknown raffle.');
                }

                if (!!raffle.batches[0]?.lockedAt) {
                    throw new ApiError(400, 'Another transaction is running.');
                }

                if (!raffle.batches[0]) {
                    await tx.batch.create({ data: { raffleId, buyer, ticketCount: 0, lockedAt: new Date() } });
                } else {
                    await tx.batch.update({ where: { id: raffle.batches[0].id }, data: { lockedAt: new Date() } });
                }
            })
            .then(async () => {
                solanaTx.addSignature(owner, Buffer.from(params.signature, 'base64'));

                const signature = await connection.sendRawTransaction(solanaTx.serialize());
                const latestBlockhash = await connection.getLatestBlockhash();

                const {
                    value: { err },
                } = await connection.confirmTransaction({ signature, ...latestBlockhash });

                if (err) {
                    throw new ApiError(500, 'Transaction error.');
                }

                await prisma.$connect();

                return prisma.batch
                    .update({
                        where: { raffleId_buyer: { raffleId, buyer } },
                        data: { ticketCount: { increment: Number(ticketCount) } },
                    })
                    .then(() => [200, {}]);
            }) as HandlerResult
    ).finally(async () => {
        await prisma.$connect();

        await prisma.batch.updateMany({ where: { raffleId, buyer }, data: { lockedAt: null } });
    });
};

export default handleJsonResponse(handler);
