import { Game, Nft, Quest } from '@prisma/client';

export type Stats = {
    clanId: number;
    clanName: string;
    clanMultiplier: number;
    total: number;
    played: number;
    points: number;
};

export interface GetCurrentGameResult {
    currentGame?: Game;
    clanStats?: Stats[];
    nfts?: (Nft & { quests: Quest[] })[];
    playerStats?: Stats[];
}
