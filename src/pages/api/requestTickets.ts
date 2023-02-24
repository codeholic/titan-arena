import { sha512 } from '@noble/hashes/sha512';
import { PrismaClient } from '@prisma/client';
import { createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { NextApiRequest } from 'next';
import { MYTHIC_DECIMALS } from '../../lib/constants';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';
import { findAssociatedAddress } from '../../lib/utils';

interface RequestRewardParams {
    raffleId: number;
    ticketCount: bigint;
    buyer: string;
}

const handler = async (req: NextApiRequest, prisma: PrismaClient): HandlerResult => {
    const { raffleId, ticketCount, buyer }: RequestRewardParams = req.body;

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);
    const prizePool = new PublicKey(process.env.NEXT_PUBLIC_PRIZE_POOL_PUBLIC_KEY!);
    const owner = new PublicKey(buyer);

    const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });

    if (!raffle) {
        return [400, { message: 'Unknown raffle.' }];
    }

    const amount = BigInt(raffle.ticketPrice) * BigInt(ticketCount);

    const mint = new PublicKey(process.env.NEXT_PUBLIC_MYTHIC!);
    const source = findAssociatedAddress({ mint, owner });
    const destination = findAssociatedAddress({ mint, owner: prizePool });

    const transaction = new Transaction();

    if (!(await connection.getAccountInfo(destination))) {
        transaction.add(createAssociatedTokenAccountInstruction(owner, destination, owner, mint));
    }

    transaction.add(createTransferCheckedInstruction(source, mint, destination, owner, amount, MYTHIC_DECIMALS));

    transaction.feePayer = owner;

    const { blockhash } = await connection.getLatestBlockhash('finalized');

    transaction.recentBlockhash = blockhash;

    const transactionMessage = transaction.serializeMessage().toString('base64');
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

    return [200, { transactionMessage, checksum }];
};

export default handleJsonResponse(handler);
