import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import fetch from 'node-fetch';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Nft } from '../lib/types';

export const useNfts = () => {
    const wallet = useWallet();
    const { connection } = useConnection();

    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const res = useSWR('/api/getNfts', fetcher);

    const [isLoading, setIsLoading] = useState(res.isLoading);
    const [nfts, setNfts] = useState<Nft[] | undefined>(undefined);

    const reload = () => {
        if (!wallet.connected || !wallet.publicKey || !res.data) {
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

                    setNfts(res.data.filter(({ mint }: any) => mints[mint]));
                })
                .finally(() => setIsLoading(false)))();
    };

    useEffect(
        () => {
            reload();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [wallet.connected, wallet.publicKey]
    );

    return { nfts, isLoading };
};
