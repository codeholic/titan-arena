import type { NextPage } from 'next';
import Head from 'next/head';
import React, { createContext } from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { NftCardList } from '../components/NftCardList';
import { useNfts } from '../hooks/useNfts';
import { Nft } from '../lib/types';

export type NftsContextProps = {
    isLoading: boolean;
    nfts?: Nft[];
};

export const NftsContext = createContext({
    isLoading: false,
    nfts: undefined,
} as NftsContextProps);

const Home: NextPage = () => {
    const { isLoading, nfts } = useNfts();

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

                <NftsContext.Provider value={{ isLoading, nfts }}>
                    <NftCardList />
                </NftsContext.Provider>
            </Container>
        </>
    );
};

export default Home;
