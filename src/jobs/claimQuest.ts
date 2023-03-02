import { Nft } from '@prisma/client';
import { ClaimQuestHandlerArgs } from '../lib/types';
import { calculateClanFees, calculateQuestPoints, getOldStats } from '../lib/utils';

export const execute = async ({ connection, payload, prisma, signer, timestamp }: ClaimQuestHandlerArgs) => {
    const { mints, gameId } = payload;

    const now = new Date(timestamp);
    const oldStats = await getOldStats({ connection, gameId, prisma, owner: signer });

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    const nfts = await prisma.nft.findMany({ where: { mint: { in: mints } } });

    const nftsByClanId = nfts.reduce((result: Record<string, Nft[]>, nft) => {
        result[nft.clanId] ||= [];
        result[nft.clanId].push(nft);

        return result;
    }, {});

    const clanMultipliers: Record<string, number> = (
        await prisma.clanMultiplier.findMany({
            where: { gameId },
        })
    ).reduce((result, { clanId, value }) => ({ [clanId]: value, ...result }), {});

    return Promise.all(
        Object.entries(nftsByClanId).flatMap(([clanId, nfts]) =>
            nfts.map(({ mint }, index) =>
                prisma.quest.create({
                    data: {
                        nft: { connect: { mint } },
                        game: { connect: { id: gameId } },
                        points: calculateQuestPoints(game!, clanMultipliers[clanId], now),
                        paid: calculateClanFees((oldStats?.[clanId] || 0) + index, 1),
                        startedAt: now,
                    },
                })
            )
        )
    );
};

export const unlock = ({ payload, prisma }: ClaimQuestHandlerArgs) => {
    const { mints } = payload;

    return prisma.nft.updateMany({ where: { mint: { in: mints } }, data: { lockedAt: null } });
};
