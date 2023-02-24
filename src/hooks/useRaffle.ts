import fetch from 'node-fetch';
import useSWR from 'swr';
import { PublicKey } from '@solana/web3.js';
import superjson from 'superjson';

import { GetRaffleResult } from '../lib/types';

interface UseRaffleResult extends GetRaffleResult {
    isLoading: boolean;
    reload: Function;
}

export const useRaffle = (buyer: PublicKey | null): UseRaffleResult => {
    const fetcher = (url: string, buyer: string | undefined) =>
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ buyer }),
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => res.text().then(superjson.parse));

    const {
        data,
        isLoading,
        isValidating,
        mutate: reload,
    } = useSWR(['/api/getRaffle', buyer?.toBase58()], (args) => fetcher(...args));

    return { ...((data as Object) || {}), isLoading: isLoading || isValidating, reload };
};
