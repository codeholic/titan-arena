import { ApiError } from 'next/dist/server/api-utils';
import handleExecuteTransaction from '../../lib/handleExecuteTransaction';
import { ClaimQuestHandlerArgs, RequestQuestPayload } from '../../lib/types';

import { getOwnedTokenMints } from '../../lib/utils';
import { unlock } from '../../jobs/claimQuest';

export type ConfirmPaymentResult = {};

const validateAndLock = async ({ connection, payload, prisma, signer }: ClaimQuestHandlerArgs) => {
    const { gameId, mints } = payload;

    const ownedTokenMints = await getOwnedTokenMints({ connection, owner: signer });

    if (mints.some((mint) => !ownedTokenMints.includes(mint))) {
        throw new ApiError(400, 'Unauthorized user.');
    }

    const now = new Date();

    const game = await prisma.game.findFirst({
        where: { id: gameId, opensAt: { lte: now }, endsAt: { gt: now } },
    });
    if (!game) {
        throw new ApiError(400, 'No current game.');
    }

    const nfts = await prisma.nft.findMany({
        include: { quests: { where: { gameId } } },
        where: { mint: { in: mints } },
    });

    if (mints.length !== nfts.length) {
        throw new ApiError(400, 'Unknown mints.');
    }

    if (nfts.some(({ quests }) => !!quests.length)) {
        throw new ApiError(400, 'Duplicate quests.');
    }

    return prisma.nft.updateMany({ where: { mint: { in: mints } }, data: { lockedAt: new Date() } });
};

export default handleExecuteTransaction<RequestQuestPayload>({
    handler: 'claimQuest',
    validateAndLock,
    unlock,
    signByAuthority: false,
});
