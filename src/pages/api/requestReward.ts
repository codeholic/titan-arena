import { sha512 } from '@noble/hashes/sha512';
import { PrismaClient } from '@prisma/client';
import { createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { NextApiRequest } from 'next';
import { MYTHIC_DECIMALS } from '../../lib/constants';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';
import { calculatePendingReward, findAssociatedAddress } from '../../lib/utils';

interface RequestRewardParams {
    claimedAt: Date;
    mints: string[];
    player: string;
}

const handler = async (req: NextApiRequest): HandlerResult => {
    const { claimedAt, mints, player }: RequestRewardParams = req.body;

    const prisma = new PrismaClient();

    const amount = await calculatePendingReward(prisma, claimedAt, mints);
    if (amount === BigInt(0)) {
        return [422, 'No reward to claim.'];
    }

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);
    const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));
    const owner = new PublicKey(player);

    const mint = new PublicKey(process.env.NEXT_PUBLIC_MYTHIC_MINT!);
    const source = findAssociatedAddress({ mint, owner: authority.publicKey });
    const destination = findAssociatedAddress({ mint, owner });

    const transaction = new Transaction();

    if (!(await connection.getAccountInfo(destination))) {
        transaction.add(createAssociatedTokenAccountInstruction(owner, destination, owner, mint));
    }

    transaction.add(
        createTransferCheckedInstruction(source, mint, destination, authority.publicKey, amount, MYTHIC_DECIMALS)
    );

    transaction.feePayer = owner;

    const { blockhash } = await connection.getLatestBlockhash('finalized');

    transaction.recentBlockhash = blockhash;

    const transactionMessage = transaction.serializeMessage().toString('base64');
    const checksum = Buffer.from(
        sha512(
            JSON.stringify({
                transactionMessage,
                claimedAt,
                mints,
                salt,
            })
        )
    ).toString('base64');

    return [200, { transactionMessage, checksum }];
};

export default handleJsonResponse(handler);
