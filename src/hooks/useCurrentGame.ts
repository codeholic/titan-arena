import fetch from 'node-fetch';
import useSWR from 'swr';
import { PublicKey } from '@solana/web3.js';
import superjson from 'superjson';

import { GetCurrentGameResult, Stats } from '../lib/types';
import { Game, Nft, Quest } from '@prisma/client';

export type UseCurrentGameResult = GetCurrentGameResult & {
    currentGame?: Game;
    clanStats?: Stats[];
    isLoading: boolean;
    isValidating: boolean;
    nfts?: Nft & { quests: Quest[] };
    pendingReward?: bigint;
    playerStats?: Stats[];
    reload: Function;
};

export const useCurrentGame = (player: PublicKey | null): UseCurrentGameResult => {
    const fetcher = (url: string, player: string | undefined) =>
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ player }),
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => res.text().then(superjson.parse));

    const refreshInterval = 30000; // milliseconds

    const {
        data,
        isLoading,
        isValidating,
        mutate: reload,
    } = useSWR(['/api/getCurrentGame', player?.toBase58()], (args) => fetcher(...args), { refreshInterval });

    return { ...((data as Object) || {}), isLoading, isValidating, reload };
};
