import { Nft, Prisma, PrismaClient, Quest } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';
import handleJsonResponse, { HandlerArgs, HandlerResult } from '../../lib/handleJsonResponse';
import { GetCurrentGameResult, Stats } from '../../lib/types';
import { getOwnedTokenMints } from '../../lib/utils';

const handler = async ({ req }: HandlerArgs): HandlerResult => {
    const { player }: { player: string } = req.body;

    const prisma = new PrismaClient();

    const now = new Date();

    const currentGame = await prisma.game.findFirst({ where: { opensAt: { lte: now }, endsAt: { gt: now } } });
    if (!currentGame) {
        return [404, { message: 'No current game.' }];
    }

    const getStats = (mints: string[] | null = null): Promise<Stats[]> => prisma.$queryRaw`
        SELECT
            Clan.name AS clanName,
            ClanMultiplier.value AS clanMultiplier,
            COUNT(Nft.id) AS total,
            COUNT(Quest.id) AS played,
            SUM(
                ROUND(
                    MIN(
                        (CAST(Game.endsAt AS FLOAT) - Quest.startedAt) / (CAST(Game.endsAt AS FLOAT) - Game.startsAt),
                        1.0
                    ) * ClanMultiplier.value * 100 + 0.5 - 1E-10
                )
            ) AS points
        FROM
            Game
            INNER JOIN ClanMultiplier ON ClanMultiplier.gameId = Game.id
            INNER JOIN Clan ON Clan.id = ClanMultiplier.clanId
            INNER JOIN Nft ON Nft.clanId = Clan.id
            LEFT JOIN Quest ON Quest.gameId = Game.id AND Quest.nftId = Nft.id
        WHERE
            Game.id = ${currentGame.id}
            AND (Nft.mint IN (${Prisma.join(!mints ? [null] : mints)}) OR ${!mints ? 0 : 1} = 0)
        GROUP BY
            Clan.name
        ORDER BY
            Clan.position
    `;

    const clanStats = await getStats();
    const { nfts, playerStats }: { nfts?: (Nft & { quests: Quest[] })[]; playerStats?: Stats[] } = !player
        ? {}
        : await (async () => {
              const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);
              const mints = await getOwnedTokenMints({ connection, owner: new PublicKey(player) });

              const nfts = await prisma.nft.findMany({
                  where: { mint: { in: mints } },
                  include: { quests: { where: { gameId: currentGame.id } } },
              });
              console.log(nfts);
              const playerStats = await getStats(mints);

              return { nfts, playerStats };
          })();

    return [
        200,
        {
            currentGame,
            clanStats,
            playerStats,
            nfts,
        } as GetCurrentGameResult,
    ];
};

export default handleJsonResponse(handler);
