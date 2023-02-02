import { Nft, PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import { DocumentReference, getFirestore, Timestamp } from 'firebase-admin/firestore';

const env = require('@next/env');

(async () => {
    await env.loadEnvConfig(process.env.PWD);

    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)) });

    const db = getFirestore();

    type QuestData = {
        game: DocumentReference;
        isRewardClaimed: boolean;
        mint: string;
        points: number;
        startedAt: Timestamp;
    };

    const questData = await db
        .collection('quests')
        .get()
        .then((querySnapshot) =>
            querySnapshot.docs.reduce((result: Record<string, QuestData[]>, doc) => {
                const data = doc.data();

                const gamePath = data.game.path;
                const gameQuests = result[gamePath] || [];

                return { ...result, [gamePath]: [data, ...gameQuests] };
            }, {})
        );

    const prisma = new PrismaClient();

    await Promise.all(
        Object.entries(questData).map(async ([gamePath, quests]) => {
            const { opensAt, startsAt, endsAt } = (await db.doc(gamePath).get()).data() || {};

            return prisma.game.create({
                data: {
                    opensAt: opensAt.toDate(),
                    startsAt: opensAt.toDate(),
                    endsAt: opensAt.toDate(),
                    quests: { create: await Promise.all((quests as QuestData[]).map(async ({ isRewardClaimed, mint, points, startedAt }: QuestData) => {
                        const nft = await prisma.nft.findUnique({ where: { mint } }) as Nft;

                        return { isRewardClaimed, nftId: nft.id, points, startedAt: startedAt.toDate() };
                    })) },
                },
            });
        })
    );
})();
