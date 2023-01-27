import fetch from 'node-fetch';
import { useMemo } from 'react';
import useSWR from 'swr';

import { Game } from '../lib/types';

export const useCurrentGame = (): { currentGame?: Game; isLoading: boolean } => {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    const { data, isLoading } = useSWR('/api/getCurrentGame', fetcher);

    const { currentGame } = useMemo(() => data || {}, [data]);

    return { currentGame, isLoading };
};
