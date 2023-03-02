import { ClaimQuestHandlerArgs } from '../lib/types';
import { calculateQuestPoints } from '../lib/utils';

export const execute = async ({ payload, prisma, timestamp }: ClaimQuestHandlerArgs) => {
    const { mints, gameId } = payload;

    return Promise.all(
        mints.map(async (mint) => {
            const { clanId } = (await prisma.nft.findUnique({ where: { mint } }))!;

            const { value: clanMultiplier } = (await prisma.clanMultiplier.findFirst({
                where: { clanId: clanId, gameId },
            }))!;

            const game = await prisma.game.findUnique({ where: { id: gameId } });

            return prisma.quest.create({
                data: {
                    nft: { connect: { mint } },
                    game: { connect: { id: gameId } },
                    points: calculateQuestPoints(game!, clanMultiplier),
                    startedAt: new Date(timestamp),
                },
            });
        })
    );
};

export const unlock = ({ payload, prisma }: ClaimQuestHandlerArgs) => {
    const { mints } = payload;

    return prisma.nft.updateMany({ where: { mint: { in: mints } }, data: { lockedAt: null } });
};
