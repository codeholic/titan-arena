import { ApiError } from 'next/dist/server/api-utils';
import handleExecuteTransaction from '../../lib/handleExecuteTransaction';
import { ClaimRewardHandlerArgs } from '../../lib/types';
import { getOwnedTokenMints } from '../../lib/utils';
import { unlock } from '../../jobs/claimReward';

const validateAndLock = async ({ connection, payload, prisma, signer, timestamp }: ClaimRewardHandlerArgs) => {
    const { mints } = payload;

    const ownedTokenMints = new Set(await getOwnedTokenMints({ connection, owner: signer }));

    if (mints.some((mint) => !ownedTokenMints.has(mint))) {
        throw new ApiError(400, 'Unauthorized user.');
    }

    const lockedMints: Set<string> = new Set();

    const games = await prisma.game.findMany({ where: { endsAt: { lte: new Date(timestamp) } } });

    const nfts = await prisma.nft.findMany({
        where: { mint: { in: mints } },
        include: { quests: { where: { gameId: { in: games.map(({ id }) => id) } } } },
    });

    if (nfts.length != mints.length) {
        throw new ApiError(400, 'Unknown mints.');
    }

    nfts.forEach(({ mint, quests }) => {
        if (quests.some(({ rewardClaimedAt }) => !rewardClaimedAt)) {
            lockedMints.add(mint);
        }
    });

    if (nfts.some(({ lockedAt, mint }) => lockedMints.has(mint) && lockedAt)) {
        throw new ApiError(400, 'Another transaction is running.');
    }

    return prisma.nft.updateMany({
        where: {
            mint: {
                in: [...lockedMints],
            },
        },
        data: { lockedAt: new Date(timestamp) },
    });
};

export default handleExecuteTransaction({
    handler: 'claimReward',
    validateAndLock,
    unlock,
    signByAuthority: true,
});
