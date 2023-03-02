import { createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { ApiError } from 'next/dist/server/api-utils';
import { MYTHIC_DECIMALS } from '../../lib/constants';
import handleRequestTransaction, { RequestTransactionHandlerArgs } from '../../lib/handleRequestTransaction';
import { RequestRewardPayload } from '../../lib/types';
import { calculatePendingReward, findAssociatedAddress } from '../../lib/utils';

const handler = async ({
    payload,
    prisma,
    signer,
    timestamp,
}: RequestTransactionHandlerArgs<RequestRewardPayload>): Promise<Transaction> => {
    const { mints }: RequestRewardPayload = payload;

    const amount = await calculatePendingReward(prisma, new Date(timestamp), mints);
    if (amount === BigInt(0)) {
        throw new ApiError(404, 'No reward to claim.');
    }

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);
    const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));

    const mint = new PublicKey(process.env.NEXT_PUBLIC_MYTHIC!);
    const source = findAssociatedAddress({ mint, owner: authority.publicKey });
    const destination = findAssociatedAddress({ mint, owner: signer });

    const transaction = new Transaction();

    if (!(await connection.getAccountInfo(destination))) {
        transaction.add(createAssociatedTokenAccountInstruction(signer, destination, signer, mint));
    }

    transaction.add(
        createTransferCheckedInstruction(source, mint, destination, authority.publicKey, amount, MYTHIC_DECIMALS)
    );

    return transaction;
};

export default handleRequestTransaction(handler);
