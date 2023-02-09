import { PrismaClient } from '@prisma/client';
import { calculateQuestPoints } from '../lib/utils';

const env = require('@next/env');

(async () => {
    await env.loadEnvConfig(process.env.PWD);

    const prisma = new PrismaClient();

    const quests = await prisma.quest.findMany({
        include: {
            game: {
                include: {
                    clanMultipliers: true,
                },
            },
            nft: true,
        },
    });

    await prisma.$transaction(
        quests.map((quest) => {
            const { value: clanMultiplier } = quest.game.clanMultipliers.find(
                ({ clanId }) => clanId === quest.nft.clanId
            )!;

            return prisma.quest.update({
                data: {
                    points: calculateQuestPoints(quest.game, clanMultiplier, quest.startedAt),
                },
                where: {
                    id: quest.id,
                },
            });
        })
    );
})();
