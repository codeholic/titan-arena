import { sha512 } from '@noble/hashes/sha512';
import { Connection, Message, Transaction } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

type ConfirmPaymentParams = {
    mints: string[];
    transactionMessage: string;
    checksum: string;
    signature: string;
};

export type ConfirmPaymentResult = {};

export type ConfirmPaymentError = {
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ConfirmPaymentResult | ConfirmPaymentError>
) {
    const params: ConfirmPaymentParams = req.body;

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
    const checksum = Buffer.from(sha512(params.transactionMessage + params.mints.length + salt)).toString('base64');

    if (checksum !== params.checksum) {
        res.status(400).json({ message: 'Wrong checksum.' });
        return;
    }

    const endpoint = process.env.NEXT_PUBLIC_CLUSTER_API_URL!;
    const connection = new Connection(endpoint);

    const transaction = Transaction.populate(Message.from(Buffer.from(params.transactionMessage, 'base64')), []);

    transaction.addSignature(transaction.feePayer!, Buffer.from(params.signature, 'base64'));

    await connection
        .sendRawTransaction(transaction.serialize())
        .then((signature) =>
            connection
                .getLatestBlockhash()
                .then((latestBlockhash) => connection.confirmTransaction({ signature, ...latestBlockhash }))
        )
        .then(() => res.status(200).json({}));
}
