import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import fetch from 'node-fetch';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { getOwnedTokenMints } from '../lib/utils';

import { Nft } from '../lib/types';

export const useNfts = () => {
    const wallet = useWallet();
    const { connection } = useConnection();

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: nftData } = useSWR('/api/getNfts', fetcher);

    const [isLoading, setIsLoading] = useState(false);
    const [nfts, setNfts] = useState<Nft[] | undefined>(undefined);

    const reload = useCallback(async () => {
        if (!wallet.connected || !wallet.publicKey || !nftData) {
            setIsLoading(false);
            setNfts(undefined);
            return;
        }

        setIsLoading(true);

        await getOwnedTokenMints({ connection, owner: wallet.publicKey! })
            .then((ownedTokenMints) => setNfts(nftData.filter(({ mint }: any) => ownedTokenMints[mint])))
            .finally(() => setIsLoading(false));
    }, [wallet.connected, wallet.publicKey, nftData, connection]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { nfts, isLoading, reload };
};
