import { sha512 } from '@noble/hashes/sha512';
import { createTransferCheckedInstruction } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, /* SystemProgram, */ Transaction } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Error } from '../../lib/types';
import { findAssociatedAddress } from '../../lib/utils';

type BuildPaymentParams = {
    payer: string;
    nftCount: number;
};

export type BuildPaymentResult = {
    transactionMessage: string;
    checksum: string;
};

const LAMPORTS_PER_NFT = BigInt('10000000');

export default async function handler(req: NextApiRequest, res: NextApiResponse<BuildPaymentResult | Error>) {
    const params: BuildPaymentParams = req.body;

    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

    const payer = new PublicKey(params.payer);
    const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));
    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;

    const transaction = new Transaction();

    const mint = new PublicKey(process.env.NEXT_PUBLIC_DUSA!);
    const source = findAssociatedAddress({ mint, owner: payer });
    const destination = findAssociatedAddress({ mint, owner: authority.publicKey });

    transaction.add(
        // SystemProgram.transfer({
        //     fromPubkey: payer,
        //     toPubkey: authority.publicKey,
        //     lamports: LAMPORTS_PER_NFT * BigInt(params.nftCount),
        // }),
        createTransferCheckedInstruction(
            source,
            mint,
            destination,
            payer,
            LAMPORTS_PER_NFT * BigInt(params.nftCount),
            9
        )
    );

    transaction.feePayer = payer;

    await connection.getLatestBlockhash('finalized').then(({ blockhash }) => {
        transaction.recentBlockhash = blockhash;

        const transactionMessage = transaction.serializeMessage().toString('base64');
        const checksum = Buffer.from(sha512(transactionMessage + params.nftCount + salt)).toString('base64');

        res.status(200).json({ transactionMessage, checksum });
    });
}
