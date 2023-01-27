import fetch from 'node-fetch';
import { useMemo } from 'react';
import useSWR from 'swr';

import { Game, Nft, Quest } from '../lib/types';

export const useQuests = (nfts?: Nft[]): { quests?: Quest[]; currentGame?: Game; isLoading: boolean } => {
    const fetcher = (url: string, mints: string[]) =>
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ mints }),
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => res.json());

    const mints = useMemo(() => nfts?.map(({ mint }) => mint), [nfts]);

    const { data, isLoading } = useSWR(!!nfts?.length && ['/api/getQuests', mints], ([url, mints]) => {
        return !!mints && fetcher(url, mints);
    });

    const { quests, currentGame } = data || {};

    console.log(nfts);
    console.log(data);

    return { quests, currentGame, isLoading };
};
