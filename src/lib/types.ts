import { Connection, PublicKey } from '@solana/web3.js';
import { Game, Nft, Prisma, Quest } from '@prisma/client';

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

export type ExecuteTransactionHandlerArgs<TPayload> = {
    connection: Connection;
    payload: TPayload;
    prisma: Prisma.TransactionClient;
    signer: PublicKey;
    timestamp: number;
};

export type ExecuteTransactionHandler<TPayload> = (_args: ExecuteTransactionHandlerArgs<TPayload>) => Promise<any>;

export type RequestTransactionParams<T> = {
    signer: string;
    payload: T;
};

export type RequestTransactionResult = {
    transactionMessage: string;
    checksum: string;
    timestamp: number;
};

export type ExecuteTransactionParams<TPayload> = {
    checksum: string;
    timestamp: number;
    transactionMessage: string;
    signature: string;
    payload: TPayload;
};

export type RequestRewardPayload = {
    mints: string[];
};
export type ClaimRewardHandlerArgs = ExecuteTransactionHandlerArgs<RequestRewardPayload>;

export type RequestQuestPayload = {
    gameId: number;
    mints: string[];
};
export type ClaimQuestHandlerArgs = ExecuteTransactionHandlerArgs<RequestQuestPayload>;
