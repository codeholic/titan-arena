import { Nft, PrismaClient, Quest } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { NextApiRequest } from 'next';
import handleJsonResponse, { HandlerResult } from '../../lib/handleJsonResponse';
import { GetCurrentGameResult, Stats } from '../../lib/types';
import { getStats, getOwnedTokenMints } from '../../lib/utils';

const handler = async (req: NextApiRequest): HandlerResult => {
    const { player }: { player: string } = req.body;

    const prisma = new PrismaClient();

    const now = new Date();

    const currentGame = await prisma.game.findFirst({ where: { opensAt: { lte: now }, endsAt: { gt: now } } });
    if (!currentGame) {
        return [404, { message: 'No current game.' }];
    }

    const clanStats = await getStats(prisma, currentGame.id);
    const { nfts, playerStats }: { nfts?: (Nft & { quests: Quest[] })[]; playerStats?: Stats[] } = !player
        ? {}
        : await (async () => {
              const connection = new Connection(process.env.NEXT_PUBLIC_CLUSTER_API_URL!);
              const mints = await getOwnedTokenMints({ connection, owner: new PublicKey(player) });

              const nfts = await prisma.nft.findMany({
                  where: { mint: { in: mints } },
                  include: { quests: { where: { gameId: currentGame.id } } },
              });

              const playerStats = await getStats(prisma, currentGame.id, mints);

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
