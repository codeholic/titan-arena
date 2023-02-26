import { Game, Nft, Quest } from '@prisma/client';

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

export interface BuildTransactionResult {
    transactionMessage: string;
    checksum: string;
}
