import { Connection, PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Game, Nft, Prisma, PrismaClient, Quest } from '@prisma/client';
import { Stats } from './types';

export const findAssociatedAddress = ({ mint, owner }: { mint: PublicKey; owner: PublicKey }): PublicKey => {
    const [address] = PublicKey.findProgramAddressSync(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    return address;
};

interface GetOwnedTokenMintsProps {
    connection: Connection;
    owner: PublicKey;
}

export const getOwnedTokenMints = ({ connection, owner }: GetOwnedTokenMintsProps): Promise<string[]> =>
    connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }).then(({ value }) =>
        value.reduce((result: string[], data) => {
            const {
                mint,
                tokenAmount: { amount },
            } = data.account.data.parsed.info;

            return amount === '0' ? result : [mint, ...result];
        }, [])
    );

export const getStats = (prisma: PrismaClient, id: number, mints?: string[]): Promise<Stats[]> =>
    prisma.$queryRaw`
        SELECT
            Clan.id AS clanId,
            Clan.name AS clanName,
            ClanMultiplier.value AS clanMultiplier,
            COUNT(Nft.id) AS total,
            COUNT(Quest.id) AS played,
            IFNULL(
                SUM(
                    ROUND(
                        MIN(
                            (CAST(Game.endsAt AS FLOAT) - Quest.startedAt) / (CAST(Game.endsAt AS FLOAT) - Game.startsAt),
                            1.0
                        ) * ClanMultiplier.value * 100 + 0.5 - 1E-10
                    )
                ),
                0
            ) AS points
        FROM
            Game
            INNER JOIN ClanMultiplier ON ClanMultiplier.gameId = Game.id
            INNER JOIN Clan ON Clan.id = ClanMultiplier.clanId
            INNER JOIN Nft ON Nft.clanId = Clan.id
            LEFT JOIN Quest ON Quest.gameId = Game.id AND Quest.nftId = Nft.id
        WHERE
            Game.id = ${id}
            AND (Nft.mint IN (${Prisma.join(!mints ? [null] : mints)}) OR ${!mints ? 0 : 1} = 0)
        GROUP BY
            Clan.id
        ORDER BY
            Clan.position
        `;

export const BASE_POINTS = 100;

export const calculateQuestPoints = (game: Game, clanMultiplier: number, startedAt?: Date): number => {
    startedAt ||= new Date();

    const durationMultiplier =
        game!.startsAt.valueOf() > startedAt.valueOf()
            ? 1
            : (game.endsAt.valueOf() - startedAt.valueOf()) / (game.endsAt.valueOf() - game.startsAt.valueOf());

    return Math.ceil(BASE_POINTS * durationMultiplier * clanMultiplier);
};
