import { sha512 } from '@noble/hashes/sha512';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

type BuildPaymentParams = {
    payer: string;
    nftCount: number;
};

export type BuildPaymentResult = {
    transactionMessage: string;
    checksum: string;
};

export type BuildPaymentError = {
    message: string;
};

// const LAMPORTS_PER_NFT = BigInt('100000000');
const LAMPORTS_PER_NFT = BigInt('1000000');

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<BuildPaymentResult | BuildPaymentError>
) {
    const params: BuildPaymentParams = req.body;

    const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);

    const payer = new PublicKey(params.payer);
    const authority = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.AUTHORITY_PRIVATE_KEY!)));
    const salt = process.env.TRANSACTION_MESSAGE_SIGNATURE_SALT!;

    const transaction = new Transaction();

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: authority.publicKey,
            lamports: LAMPORTS_PER_NFT * BigInt(params.nftCount),
        })
    );

    transaction.feePayer = payer;

    await connection.getLatestBlockhash('finalized').then(({ blockhash }) => {
        transaction.recentBlockhash = blockhash;

        const transactionMessage = transaction.serializeMessage().toString('base64');
        const checksum = Buffer.from(sha512(transactionMessage + salt)).toString('base64');

        res.status(200).json({ transactionMessage, checksum });
    });
}
