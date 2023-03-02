import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { LAMPORTS_PER_NFT } from '../../lib/utils';
import handleRequestTransaction, { RequestTransactionHandlerArgs } from '../../lib/handleRequestTransaction';
import { RequestQuestPayload } from '../../lib/types';

const handler = async ({
    payload,
    signer,
}: RequestTransactionHandlerArgs<RequestQuestPayload>): Promise<Transaction> => {
    const { mints } = payload;

    const transaction = new Transaction();
    const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: signer,
            toPubkey: authority.publicKey,
            lamports: LAMPORTS_PER_NFT * BigInt(mints.length),
        })
    );

    return transaction;
};

export default handleRequestTransaction(handler);
