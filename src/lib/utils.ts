import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { Connection, PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Game, Prisma, PrismaClient } from '@prisma/client';
import { Stats } from './types';
import BigNumber from 'bignumber.js';
import { FEE_THRESHOLDS } from './constants';

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m));

export const sign = (message: Parameters<typeof ed25519.sync.sign>[0], secretKey: Uint8Array) =>
    ed25519.sync.sign(message, secretKey.slice(0, 32));

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

export const getStats = (
    prisma: PrismaClient,
    gameId: number,
    mints?: string[],
    onlyUnclaimed: boolean = false
): Promise<Stats[]> =>
    prisma.$queryRaw`
        SELECT
            Clan.id AS clanId,
            Clan.name AS clanName,
            ClanMultiplier.value AS clanMultiplier,
            COUNT(Nft.id) AS total,
            COUNT(Quest.id) AS played,
            IFNULL(SUM(Quest.points), 0) AS points,
            IFNULL(SUM(Quest.paid), 0) as paid
        FROM
            Game
            INNER JOIN ClanMultiplier ON ClanMultiplier.gameId = Game.id
            INNER JOIN Clan ON Clan.id = ClanMultiplier.clanId
            INNER JOIN Nft ON Nft.clanId = Clan.id
            LEFT JOIN Quest ON Quest.gameId = Game.id AND Quest.nftId = Nft.id
        WHERE
            Game.id = ${gameId}
            AND (Nft.mint IN (${Prisma.join(!mints ? [null] : mints)}) OR ${!mints ? 0 : 1} = 0)
            AND (Quest.rewardClaimedAt IS NULL OR ${!onlyUnclaimed ? 0 : 1} = 0)
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

    return Math.ceil(Number((BASE_POINTS * durationMultiplier * clanMultiplier).toFixed(6)));
};

const WINNERS_SHARE_PERCENT = BigInt(70);
const RUNNERUPS_SHARE_PERCENT = BigInt(20);
export const EMISSION_RATE = BigInt(1000);

export const getEarnings = (
    clanStats: Stats[],
    playerStats?: Stats[]
): {
    totalPaid: bigint;
    totalEarned: bigint;
    clanEarnings: bigint[];
    firstPlace: Record<number, boolean>;
    lastPlace: Record<number, boolean>;
    playerPaid?: bigint;
    playerEarnings?: bigint[];
    playerEarned?: bigint;
} => {
    const totalPaid = clanStats.reduce((result, { paid }) => result + paid, BigInt(0));
    const totalEarned = totalPaid * EMISSION_RATE;

    const sortedClanStats = [...clanStats];
    sortedClanStats.sort((a, b) => Number(b.points - a.points));

    const firstPlace: Record<number, boolean> = {},
        lastPlace: Record<number, boolean> = {};

    if (sortedClanStats[0].points > sortedClanStats[1].points) {
        firstPlace[sortedClanStats[0].clanId] = true;
    } else if (sortedClanStats[1].points > sortedClanStats[2].points) {
        firstPlace[sortedClanStats[0].clanId] = firstPlace[sortedClanStats[1].clanId] = true;
    }

    const lastIndex = sortedClanStats.length - 1;

    if (sortedClanStats[lastIndex].points < sortedClanStats[lastIndex - 1].points) {
        lastPlace[sortedClanStats[lastIndex].clanId] = true;
    } else if (sortedClanStats[lastIndex - 1].points < sortedClanStats[lastIndex - 2].points) {
        lastPlace[sortedClanStats[lastIndex].clanId] = lastPlace[sortedClanStats[lastIndex - 1].clanId] = true;
    }

    const clanEarnings = clanStats.map(({ clanId }) =>
        firstPlace[clanId]
            ? (totalEarned * WINNERS_SHARE_PERCENT) / BigInt(100) / BigInt(Object.keys(firstPlace).length)
            : lastPlace[clanId]
            ? BigInt(0)
            : (totalEarned * RUNNERUPS_SHARE_PERCENT) /
              BigInt(100) /
              BigInt(clanStats.length - Object.keys(firstPlace).length - Object.keys(lastPlace).length)
    );

    const playerPaid = playerStats && playerStats.reduce((result, { paid }) => result + paid, BigInt(0));

    const playerStatsMap = playerStats?.reduce(
        (result: Record<number, Stats>, stats: Stats) => ({ [stats.clanId]: stats, ...result }),
        {}
    );

    const playerEarnings =
        playerStats &&
        clanStats.map(({ clanId, points }, index) =>
            points ? ((playerStatsMap?.[clanId]?.points ?? BigInt(0)) * clanEarnings[index]) / points : BigInt(0)
        );

    const playerEarned = playerEarnings && playerEarnings.reduce((result, share) => result + share, BigInt(0));

    return {
        totalPaid,
        totalEarned,
        firstPlace,
        lastPlace,
        clanEarnings,
        playerPaid,
        playerEarnings,
        playerEarned,
    };
};

export const calculatePendingReward = async (
    prisma: PrismaClient,
    claimedAt: Date,
    mints: string[]
): Promise<bigint> => {
    const games = await prisma.game.findMany({ where: { endsAt: { lte: claimedAt } } });

    const amount = (
        await Promise.all(
            games.map(async (game) => {
                const clanStats = await getStats(prisma, game.id);
                const playerStats = await getStats(prisma, game.id, mints, true);

                const { playerEarned } = getEarnings(clanStats, playerStats);

                return playerEarned;
            })
        )
    ).reduce((result: bigint, value) => (!value ? result : result + value), BigInt(0));

    return amount;
};

export const formatAmount = (bignum: bigint, decimals: number) =>
    Number(Number(new BigNumber(bignum.toString()).div(10 ** decimals)).toFixed(2));

const eachCons = (array: Array<any>, num: number) =>
    Array.from({ length: array.length - num + 1 }, (_, i) => array.slice(i, i + num));

interface GetOldStatsArgs {
    connection: Connection;
    prisma: Prisma.TransactionClient;
    owner: PublicKey;
    gameId: number;
}

export const getOldStats = async ({
    connection,
    gameId,
    prisma,
    owner,
}: GetOldStatsArgs): Promise<Record<string, number>> => {
    const ownedTokenMints = await getOwnedTokenMints({ connection, owner });

    return (
        await prisma.nft.groupBy({
            by: ['clanId'],
            _count: { id: true },
            where: { mint: { in: ownedTokenMints }, quests: { some: { gameId } } },
        })
    ).reduce((result, row) => ({ [row.clanId]: row._count.id, ...result }), {});
};

export const calculateClanFees = (oldCount: number, newCount: number) =>
    eachCons(FEE_THRESHOLDS, 2).reduce(
        (result, [{ threshold, fee }, { threshold: nextThreshold }]) =>
            oldCount < nextThreshold && threshold < oldCount + newCount
                ? result + BigInt(Math.min(oldCount + newCount, nextThreshold) - Math.max(oldCount, threshold)) * fee
                : result,
        BigInt(0)
    );

export interface CalculateFeesArgs {
    connection: Connection;
    prisma: Prisma.TransactionClient;
    owner: PublicKey;
    gameId: number;
    mints: string[];
}

export const calculateFees = async ({
    connection,
    prisma,
    owner,
    gameId,
    mints,
}: CalculateFeesArgs): Promise<bigint> => {
    const oldStats = await getOldStats({ connection, gameId, prisma, owner });

    const newStats = (
        await prisma.nft.groupBy({
            by: ['clanId'],
            _count: { id: true },
            where: { mint: { in: mints } },
        })
    ).reduce((result, row) => ({ [row.clanId]: row._count.id, ...result }), {} as Record<string, number>);

    return Object.entries(newStats).reduce(
        (result: bigint, [clanId, count]) => result + calculateClanFees(oldStats?.[clanId] || 0, count),
        BigInt(0)
    );
};
