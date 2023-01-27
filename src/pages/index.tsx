import type { NextPage } from 'next';
import Head from 'next/head';
import React, { createContext, useEffect, useState } from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { NftCardList } from '../components/NftCardList';
import { useNfts } from '../hooks/useNfts';
import { Game, Nft, Quest } from '../lib/types';
import { useQuests } from '../hooks/useQuests';

export type DataContextProps = {
    isLoading: boolean;
    nfts?: Nft[];
    quests?: Quest[];
    currentGame?: Game;
};

export const DataContext = createContext({
    isLoading: false,
    nfts: undefined,
    quests: undefined,
    currentGame: undefined,
} as DataContextProps);

const Home: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    const { nfts, isLoading: areNftsLoading } = useNfts();
    const { quests, currentGame, isLoading: areQuestsLoading } = useQuests(nfts);

    useEffect(() => setIsLoading(areNftsLoading || areQuestsLoading), [areNftsLoading, areQuestsLoading]);

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

                <DataContext.Provider value={{ isLoading, nfts, quests, currentGame }}>
                    <NftCardList />
                </DataContext.Provider>
            </Container>
        </>
    );
};

export default Home;
