import { Batch, Game, Nft, Quest, Raffle } from '@prisma/client';

export type Stats = {
    clanId: number;
    clanName: string;
    clanMultiplier: number;
    total: bigint;
    played: bigint;
    points: bigint;
};

export interface GetCurrentGameResult {
    currentGame?: Game;
    clanStats?: Stats[];
    nfts?: (Nft & { quests: Quest[] })[];
    playerStats?: Stats[];
}

export interface GetRaffleResult {
    raffle?: Raffle & { ticketPrice: bigint; ticketsSold: number };
    batch?: Batch;
}
