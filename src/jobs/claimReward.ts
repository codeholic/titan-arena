import { ClaimRewardHandlerArgs } from '../lib/types';

export const execute = async ({ payload, prisma, timestamp }: ClaimRewardHandlerArgs) => {
    const { mints } = payload;

    const games = await prisma.game.findMany({ where: { endsAt: { lte: new Date(timestamp) } } });

    return Promise.all(
        mints.map((mint) =>
            prisma.nft.update({
                where: { mint },
                data: {
                    quests: {
                        updateMany: {
                            where: { gameId: { in: games.map(({ id }) => id) }, rewardClaimedAt: null },
                            data: { rewardClaimedAt: new Date(timestamp) },
                        },
                    },
                },
            })
        )
    );
};

export const unlock = ({ payload, prisma }: ClaimRewardHandlerArgs) => {
    const { mints } = payload;

    return prisma.nft.updateMany({ where: { mint: { in: mints } }, data: { lockedAt: null } });
};
