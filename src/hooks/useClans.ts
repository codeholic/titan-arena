import fetch from 'node-fetch';
import { useMemo } from 'react';
import useSWR from 'swr';

import { Clan } from '../lib/types';

export const useClans = (): { clans?: Clan[]; isLoading: boolean } => {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const { data, isLoading } = useSWR('/api/getClans', fetcher);

    const { clans } = useMemo(() => data || {}, [data]);

    return { clans, isLoading };
};
