import fetch from 'node-fetch';
import useSWR from 'swr';
import { PublicKey } from '@solana/web3.js';
import superjson from 'superjson';

import { GetCurrentGameResult } from '../lib/types';

export type UseCurrentGameResult = GetCurrentGameResult & {
    isLoading: boolean;
    reload: Function;
}

export const useCurrentGame = (player: PublicKey | null): UseCurrentGameResult => {
    const fetcher = (url: string, player: string | undefined) => fetch(url, {
        method: 'POST',
        body: JSON.stringify({ player }),
        headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.text().then(superjson.parse));

    const { data, isLoading, mutate: reload } = useSWR(['/api/getCurrentGame', player?.toBase58()], (args) => fetcher(...args));

    return { ...(data || {}), isLoading, reload };
};
