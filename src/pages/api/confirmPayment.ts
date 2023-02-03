import { sha512 } from '@noble/hashes/sha512';
import { Connection, Message, Transaction } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getFirestore, getCurrentGame, getNfts, getQuests, getClans, calculateReward } from '../../lib/queries';
import { Clan, Error, Nft } from '../../lib/types';
import { getOwnedTokenMints } from '../../lib/utils';

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
        res.status(400).json({ message: 'Unknown mints.' });
    }

    const solanaTx = Transaction.populate(Message.from(Buffer.from(params.transactionMessage, 'base64')), []);
    if (!solanaTx.feePayer) {
        res.status(400).json({ message: 'Invalid transaction.' });
    }

    const endpoint = process.env.NEXT_PUBLIC_CLUSTER_API_URL!;
    const connection = new Connection(endpoint);

    const ownedTokenMints = await getOwnedTokenMints({ connection, owner: solanaTx.feePayer! });

    if (params.mints.some((mint) => !ownedTokenMints[mint])) {
        res.status(400).json({ message: 'Unauthorized user.' });
    }

    const db = getFirestore();

    await db
        .runTransaction((transaction) =>
            getCurrentGame(transaction).then(({ ref: currentGameRef, data: currentGame }) =>
                getQuests(currentGameRef, params.mints, transaction)
                    .then((quests) => {
                        if (!!Object.keys(quests).length) {
                            return Promise.reject({ message: 'Duplicate quests.' });
                        }

                        solanaTx.addSignature(solanaTx.feePayer!, Buffer.from(params.signature, 'base64'));

                        return connection
                            .sendRawTransaction(solanaTx.serialize())
                            .then((signature) =>
                                connection
                                    .getLatestBlockhash()
                                    .then((latestBlockhash) =>
                                        connection.confirmTransaction({ signature, ...latestBlockhash })
                                    )
                            );
                    })
                    .then(async ({ value: { err } }) => {
                        if (err) {
                            return Promise.reject({ message: 'Transaction error.' });
                        }

                        const clanMap = (await getClans(transaction)).reduce(
                            (result: Record<string, Clan>, clan) => ({ [clan.name]: clan, ...result }),
                            {}
                        );

                        const startedAt = new Date();

                        const deltas = await Promise.all(
                            params.mints.map((mint) => {
                                const ref = db.collection('quests').doc();

                                const { clan } = allNfts[mint];
                                const points = calculateReward(currentGame, clanMap[clan]);

                                transaction.create(ref, {
                                    game: currentGameRef,
                                    isRewardClaimed: false,
                                    mint,
                                    points,
                                    startedAt,
                                });

                                return { clan: clan.toLowerCase(), points };
                            })
                        );

                        const { questCounts, scores } = currentGame;

                        deltas.forEach(({ clan, points }) => {
                            questCounts[clan]++;
                            scores[clan] += points;
                        });

                        return transaction.update(currentGameRef, { questCounts, scores });
                    })
                    .then(() => {
                        res.status(200).json({});
                    })
            )
        )
        .catch(({ message }) => res.status(422).json({ message }));
}
