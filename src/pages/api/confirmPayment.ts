import { sha512 } from '@noble/hashes/sha512';
import { Game, PrismaClient } from '@prisma/client';
import { Connection, Message, Transaction } from '@solana/web3.js';
import type { NextApiRequest } from 'next';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';

import { calculateQuestPoints, getOwnedTokenMints } from '../../lib/utils';

type ConfirmPaymentParams = {
    mints: string[];
    transactionMessage: string;
    checksum: string;
    signature: string;
};

export type ConfirmPaymentResult = {};

const handler = async (req: NextApiRequest, prisma: PrismaClient): HandlerResult => {
    const params: ConfirmPaymentParams = req.body;

    const salt = process.env.TRANSACTION_MESSAGE_CHECKSUM_SALT!;
    const checksum = Buffer.from(sha512(params.transactionMessage + params.mints.length + salt)).toString('base64');

    if (checksum !== params.checksum) {
        return [400, { message: 'Wrong checksum.' }];
    }

    const solanaTx = Transaction.populate(Message.from(Buffer.from(params.transactionMessage, 'base64')), []);
    if (!solanaTx.feePayer) {
        return [400, { message: 'Invalid transaction.' }];
    }

    const endpoint = process.env.NEXT_PUBLIC_CLUSTER_API_URL!;
    const connection = new Connection(endpoint);

    const ownedTokenMints = await getOwnedTokenMints({ connection, owner: solanaTx.feePayer! });

    if (params.mints.some((mint) => !ownedTokenMints.includes(mint))) {
        return [400, { message: 'Unauthorized user.' }];
    }

    const now = new Date();
    let currentGame: Game | null;

    await prisma.$transaction(async (tx) => {
        currentGame = await tx.game.findFirst({ where: { opensAt: { lte: now }, endsAt: { gt: now } } });
        if (!currentGame) {
            return [404, { message: 'No current game.' }];
        }

        const nfts = await tx.nft.findMany({
            include: { quests: { where: { gameId: currentGame.id } } },
            where: { mint: { in: params.mints } },
        });

        if (params.mints.length !== nfts.length) {
            return [400, { message: 'Unknown mints.' }];
        }

        if (nfts.some(({ quests }) => !!quests.length)) {
            return [400, { message: 'Duplicate quests.' }];
        }

        await tx.nft.updateMany({ where: { mint: { in: params.mints } }, data: { lockedAt: new Date() } });

        return [200, {}];
    });

    solanaTx.addSignature(solanaTx.feePayer!, Buffer.from(params.signature, 'base64'));

    return (
        connection.sendRawTransaction(solanaTx.serialize()).then(async (signature) => {
            const latestBlockhash = await connection.getLatestBlockhash();

            const {
                value: { err },
            } = await connection.confirmTransaction({ signature, ...latestBlockhash });

            if (err) {
                return [422, 'Transaction error.'];
            }

            await prisma.$connect();

            return prisma
                .$transaction((tx) =>
                    Promise.all(
                        params.mints.map((mint) =>
                            tx.clanMultiplier
                                .findFirst({
                                    include: { clan: { include: { nfts: { where: { mint } } } } },
                                    where: { gameId: currentGame!.id },
                                })
                                .then((clanMultiplier) =>
                                    tx.quest.create({
                                        data: {
                                            nft: { connect: { mint } },
                                            game: { connect: { id: currentGame!.id } },
                                            points: calculateQuestPoints(currentGame!, clanMultiplier!.value),
                                            startedAt: now,
                                        },
                                    })
                                )
                        )
                    )
                )
                .then(() => [200, {}]);
        }) as HandlerResult
    ).finally(async () => {
        await prisma.$connect();

        await prisma.nft.updateMany({ where: { mint: { in: params.mints } }, data: { lockedAt: null } });
    });
};

export default handleJsonResponse(handler);
