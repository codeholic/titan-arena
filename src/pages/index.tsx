import fetch from 'node-fetch';
import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

import useSWR from 'swr';

import { CardMedia, Container, Grid } from '@mui/material';
import { Navbar } from '../components/Navbar';

const Home: NextPage = () => {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error, isLoading } = useSWR('/api/nfts', fetcher);

    console.log(data, error, isLoading);

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
                    {data &&
                        data.slice(0, 20).map(({ image_url }: any, index: number) => (
                            <Grid item key={index} xs={1}>
                                <CardMedia component="img" image={image_url} sx={{ borderRadius: '5px' }} />
                            </Grid>
                        ))}
                </Grid>
            </Container>
        </>
    );
};

export default Home;
