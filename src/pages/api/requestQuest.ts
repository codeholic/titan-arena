import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';
import { calculateFees, findAssociatedAddress } from '../../lib/utils';
import handleRequestTransaction, { RequestTransactionHandlerArgs } from '../../lib/handleRequestTransaction';
import { RequestQuestPayload } from '../../lib/types';

const handler = async ({
    connection,
    payload,
    prisma,
    signer,
}: RequestTransactionHandlerArgs<RequestQuestPayload>): Promise<Transaction> => {
    const { gameId, mints } = payload;

    const transaction = new Transaction();
    const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));

    const amount = await calculateFees({ connection, prisma, owner: signer, gameId, mints });

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: signer,
            toPubkey: authority.publicKey,
            lamports: amount,
        })
    );

    // const mint = new PublicKey(process.env.NEXT_PUBLIC_DUSA!);
    // const source = findAssociatedAddress({ mint, owner: signer });
    // const destination = findAssociatedAddress({ mint, owner: authority.publicKey });

    // transaction.add(createTransferInstruction(source, destination, signer, amount));

    return transaction;
};

export default handleRequestTransaction(handler);
