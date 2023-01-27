import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import fetch from 'node-fetch';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { Nft } from '../lib/types';

export const useNfts = () => {
    const wallet = useWallet();
    const { connection } = useConnection();

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data: nftData } = useSWR('/api/getNfts', fetcher);

    const [isLoading, setIsLoading] = useState(false);
    const [nfts, setNfts] = useState<Nft[] | undefined>(undefined);

    const reload = useCallback(() => {
        if (!wallet.connected || !wallet.publicKey || !nftData) {
            setIsLoading(false);
            setNfts(undefined);
            return;
        }

        setIsLoading(true);

        (async () =>
            await connection
                .getParsedTokenAccountsByOwner(wallet.publicKey!, { programId: TOKEN_PROGRAM_ID })
                .then(({ value }) => {
                    const mints: any = value.reduce(
                        (result, tokenAccount) => ({
                            ...result,
                            [tokenAccount.account.data.parsed.info.mint]: true,
                        }),
                        {}
                    );

                    setNfts(nftData.filter(({ mint }: any) => mints[mint]));
                })
                .finally(() => setIsLoading(false)))();
    }, [wallet.connected, wallet.publicKey, nftData, connection]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { nfts, isLoading, reload };
};
