import { sha512 } from '@noble/hashes/sha512';
import { Connection, Message, Transaction } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getFirestore } from 'firebase-admin/firestore';

import { getCurrentGame, getNfts, getQuests } from '../../lib/queries';
import { Error, Nft } from '../../lib/types';

type ConfirmPaymentParams = {
    mints: string[];
    transactionMessage: string;
    checksum: string;
    signature: string;
};

export type ConfirmPaymentResult = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ConfirmPaymentResult | Error>) {
    const params: ConfirmPaymentParams = req.body;

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
    const checksum = Buffer.from(sha512(params.transactionMessage + params.mints.length + salt)).toString('base64');

    if (checksum !== params.checksum) {
        res.status(400).json({ message: 'Wrong checksum.' });
        return;
    }

    const allNfts: Record<string, Nft> = (await getNfts()).reduce(
        (result, nft) => ({ [nft.mint]: nft, ...result }),
        {}
    );

    if (params.mints.some((mint) => !allNfts[mint])) {
        res.status(400).json({ message: 'Wrong mints.' });
    }

    const db = getFirestore();

    await db
        .runTransaction(async (transaction) => {
            const { ref: currentGameRef, data: currentGame } = await getCurrentGame(transaction);
            const quests = await getQuests(currentGameRef, params.mints, transaction);

            if (!!Object.keys(quests).length) {
                return Promise.reject({ message: 'Duplicate quests.' });
            }

            console.log(currentGame);
            console.log(quests);

            res.status(200).json({});
        })
        .catch(({ message }) => res.status(422).json({ message }));

    // const endpoint = process.env.NEXT_PUBLIC_CLUSTER_API_URL!;
    // const connection = new Connection(endpoint);

    // const transaction = Transaction.populate(Message.from(Buffer.from(params.transactionMessage, 'base64')), []);

    // transaction.addSignature(transaction.feePayer!, Buffer.from(params.signature, 'base64'));

    // await connection
    //     .sendRawTransaction(transaction.serialize())
    //     .then((signature) =>
    //         connection
    //             .getLatestBlockhash()
    //             .then((latestBlockhash) => connection.confirmTransaction({ signature, ...latestBlockhash }))
    //     )
    //     .then(() => res.status(200).json({}));
}
