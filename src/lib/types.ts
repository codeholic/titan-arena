import { Timestamp } from 'firebase-admin/firestore';

export type Trait = {
    trait_name: string;
    value: string;
};

export type Nft = {
    mint: string;
    name: string;
    image_url: string;
    attributes?: Trait[];
    clan: string;
    rank?: number;
};

export type GameStats = {
    medusa: number;
    seamonster: number;
    zeus: number;
    hades: number;
};

export type Game = {
    opensAt: Timestamp;
    startsAt: Timestamp;
    endsAt: Timestamp;
    scores: GameStats;
    questCounts: GameStats;
};

export type Quest = {
    isRewardClaimed?: boolean;
    mint: string;
    points: number;
    startedAt?: Date;
};

export type Clan = {
    name: string;
    multiplier: number;
    nftCount: number;
};

export type Error = {
    message: string;
};
