import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { useWallet } from '@solana/wallet-adapter-react';

const Raffle: NextPage = () => {
    const wallet = useWallet();

    const [isLoading, setIsLoading] = useState(false);
    const reload = async () => {
        setIsLoading(true);

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        }).finally(() => setIsLoading(false));
    };

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

                <Navbar active="raffle" isLoading={isLoading} reload={reload} />
            </Container>
        </>
    );
};

export default Raffle;
