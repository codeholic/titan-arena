import fetch from 'node-fetch';
import { useMemo } from 'react';
import useSWR from 'swr';

import { Nft, Quest } from '../lib/types';

export const useQuests = (nfts?: Nft[]): { quests?: Record<string, Quest>; isLoading: boolean; mutate: Function } => {
    const fetcher = (url: string, mints: string[]) =>
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ mints }),
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => res.json());

    const mints = useMemo(() => nfts?.map(({ mint }) => mint), [nfts]);

    const { data, isLoading, mutate } = useSWR(!!nfts?.length && ['/api/getQuests', mints], ([url, mints]) => {
        return !!mints && fetcher(url, mints);
    });

    const { quests: questArray } = data || {};
    const quests = useMemo(() => {
        if (!mints || !questArray) {
            return;
        }

        return mints.reduce((result, mint, index) => ({ [mint]: questArray[index], ...result }), {});
    }, [mints, questArray]);

    return { quests, isLoading, mutate };
};
