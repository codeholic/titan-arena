import { PrismaClient } from '@prisma/client';
import handleJsonResponse, { HandlerArgs } from '../../lib/handleJsonResponse';

type Stats = {
    clanName?: string;
    clanMultipler?: number;
    total: number;
    played: number;
    points: number;
};

type GetCurrentGameResult = {
    clanStats: Stats[];
    endsAt: Date;
    opensAt: Date;
    startsAt: Date;
};

const handler = async ({ req, send }: HandlerArgs) => {
    const prisma = new PrismaClient();

    const now = new Date();

    const currentGame = await prisma.game.findFirst({ where: { opensAt: { lte: now }, endsAt: { gt: now } } });
    if (!currentGame) {
        return send(404, { message: 'No current game.' });
    }

    const clanStats: Stats[] = await prisma.$queryRaw`
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
                    ) * ClanMultiplier.value * 100 + 0.5
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
        GROUP BY
            Clan.name
    `;

    const { endsAt, opensAt, startsAt } = currentGame;

    send(200, {
        clanStats: clanStats.reduce((result, { clanName, ...rest }) => ({ [clanName!]: rest, ...result }), {}),
        endsAt,
        opensAt,
        startsAt,
    } as GetCurrentGameResult);
};

export default handleJsonResponse(handler);
