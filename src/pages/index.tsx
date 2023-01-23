import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';

const Home: NextPage = () => {
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
            </Container>
        </>
    );
};

export default Home;
