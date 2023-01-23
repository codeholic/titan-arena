import fetch from 'node-fetch';
import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

import useSWR from 'swr';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { CardMedia, Container, Grid, Skeleton } from '@mui/material';
import { Navbar } from '../components/Navbar';

const Home: NextPage = () => {
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
                    const mints = value.reduce((result, tokenAccount) => ({ ...result, [tokenAccount.account.data.parsed.info.mint]: true }), {});

                    return res.json().then(data => data.filter((nft: any) => mints[nft.mint]));
                })
        );
    };

    const { data, isLoading } = useSWR('/api/nfts', fetcher);

    return (
        <>
            <Head>
                <title>Titan Arena</title>
                <meta name="description" content="Titan Arena: Rise to immortality" />
                <link rel="icon" href="/i/dusa.png" />
            </Head>

            <Container maxWidth="lg">
                <CardMedia
                    component="img"
                    image="/i/logo.png"
                    sx={{ maxWidth: { lg: '500px', xs: '50%' }, mx: 'auto', my: { lg: '40px', xs: '25px' } }}
                />

                <Navbar />

                <Grid my={1} container spacing={2} columns={{ xs: 2, sm: 4, md: 6, lg: 8 }}>
                    {!isLoading
                        ? data &&
                          data.map(({ image_url }: any, index: number) => (
                              <Grid item key={index} xs={1}>
                                  <CardMedia component="img" image={image_url} sx={{ borderRadius: '5px' }} />
                              </Grid>
                          ))
                        : Array(16)
                              .fill()
                              .map((_, index) => (
                                  <Grid item key={index} xs={1}>
                                      <Skeleton key={index} variant="rounded" sx={{ paddingTop: '100%' }} />
                                  </Grid>
                              ))}
                </Grid>
            </Container>
        </>
    );
};

export default Home;
