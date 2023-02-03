import { Clan } from '@prisma/client';
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

export type Game = {
    opensAt: Timestamp;
    startsAt: Timestamp;
    endsAt: Timestamp;
    scores: Record<string, number>;
    questCounts: Record<string, number>;
};

export type Quest = {
    isRewardClaimed?: boolean;
    mint: string;
    points: number;
    startedAt?: Date;
};

export type Error = {
    message: string;
};
