import fetch from 'node-fetch';

import useSWR from 'swr';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { Grid, CardMedia, Skeleton } from '@mui/material';

export const NftList = () => {
    const wallet = useWallet();
    const { connection } = useConnection();

    const fetcher = (url: string) => {
        if (!wallet.publicKey) {
            return;
        }

        return fetch(url).then((res) =>
            connection
                .getParsedTokenAccountsByOwner(wallet.publicKey!, { programId: TOKEN_PROGRAM_ID })
                .then(({ value }) => {
                    const mints: any = value.reduce(
                        (result, tokenAccount) => ({ ...result, [tokenAccount.account.data.parsed.info.mint]: true }),
                        {}
                    );

                    return res.json().then((data) => data.filter((nft: any) => mints[nft.mint]));
                })
        );
    };

    const { data, isLoading } = useSWR('/api/nfts', fetcher);

    return (
        <Grid my={1} container spacing={2} columns={{ xs: 2, sm: 4, md: 6, lg: 8 }}>
            {!isLoading
                ? data &&
                  data.map(({ image_url }: any, index: number) => (
                      <Grid item key={index} xs={1}>
                          <CardMedia component="img" image={image_url} sx={{ borderRadius: '5px' }} />
                      </Grid>
                  ))
                : Array(16)
                      .fill(undefined)
                      .map((_, index) => (
                          <Grid item key={index} xs={1}>
                              <Skeleton key={index} variant="rounded" sx={{ paddingTop: '100%' }} />
                          </Grid>
                      ))}
        </Grid>
    );
};
