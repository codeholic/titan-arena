import type { NextApiRequest, NextApiResponse } from 'next';

import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createApproveInstruction } from '@solana/spl-token';

import { sha512 } from '@noble/hashes/sha512';
import * as ed25519 from '@noble/ed25519';

import { findAssociatedAddress } from '../../lib/utils';

type FormData = {
    wallet: string;
    mints: string[];
};

export type TransactionData = {
    message: string;
    signature: string;
};

export type BuildStakeTransactionsData = {
    transactionData: TransactionData[];
};

type Error = {
    message: string;
};

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export default async function handler(req: NextApiRequest, res: NextApiResponse<BuildStakeTransactionsData | Error>) {
    const payload: FormData = JSON.parse(req.body);

    const wallet = new PublicKey(payload.wallet);
    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

    const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));

    const transactions = payload.mints.map((mint) => {
        const transaction = new Transaction();

        transaction.add(
            createApproveInstruction(
                findAssociatedAddress({ mint: new PublicKey(mint), owner: wallet }),
                keypair.publicKey,
                wallet,
                1
            ),
            new TransactionInstruction({
                programId: MEMO_PROGRAM_ID,
                keys: [{ pubkey: keypair.publicKey, isWritable: false, isSigner: true }],
                data: Buffer.from(JSON.stringify({}), 'utf8'),
            })
        );

        transaction.feePayer = wallet;

        return transaction;
    });

    return connection.getLatestBlockhash('finalized').then(({ blockhash }) => {
        res.status(200).json({
            transactionData: transactions.map((transaction) => {
                transaction.recentBlockhash = blockhash;

                const message = transaction.serializeMessage();
                const signature = Buffer.from(ed25519.sync.sign(message, keypair.secretKey.slice(0, 32))).toString(
                    'base64'
                );

                return {
                    message: message.toString('base64'),
                    signature,
                };
            }),
        });
    });
}
