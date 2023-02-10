import { PrismaClient } from '@prisma/client';
import { getStats } from '../lib/utils';

const env = require('@next/env');

(async () => {
    await env.loadEnvConfig(process.env.PWD);

    const prisma = new PrismaClient();

    const lastGame = await prisma.game.findFirst({ orderBy: { endsAt: 'desc' } });

    if (!lastGame) {
        console.log('No games found.');

        return;
    }

    if (lastGame.endsAt > new Date()) {
        console.log('The last game has not ended yet.');

        return;
    }

    const clanStats = await getStats(prisma, lastGame.id);

    const sortedClanStats = clanStats.sort((a, b) => Number(b.points - a.points));

    const opensAt = lastGame.endsAt;
    const startsAt = new Date(new Date().setDate(opensAt.getDate() + 2));
    const endsAt = new Date(new Date().setDate(opensAt.getDate() + 7));

    await prisma.game.create({
        data: {
            opensAt,
            startsAt,
            endsAt,
            clanMultipliers: {
                create: sortedClanStats.map(({ clanId, clanMultiplier }, index) => ({
                    clanId,
                    value: clanMultiplier + (index === 0 ? -0.05 : index === sortedClanStats.length - 1 ? 0.05 : 0),
                })),
            },
        },
    });
})();
