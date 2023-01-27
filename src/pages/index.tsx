import type { NextPage } from 'next';
import Head from 'next/head';
import React, { createContext, useMemo } from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { NftCardList } from '../components/NftCardList';
import { useNfts } from '../hooks/useNfts';
import { Clan, Game, Nft, Quest } from '../lib/types';
import { useQuests } from '../hooks/useQuests';
import { ClanCardList } from '../components/ClanCardList';

export type DataContextProps = {
    isLoading: boolean;
    nfts?: Nft[];
    quests?: Record<string, Quest>;
    clans?: Clan[];
    currentGame?: Game;
};

export const DataContext = createContext({
    isLoading: false,
    nfts: undefined,
    quests: undefined,
    clans: undefined,
    currentGame: undefined,
} as DataContextProps);

const Home: NextPage = () => {
    const { nfts, isLoading: areNftsLoading } = useNfts();
    const { quests, clans, currentGame, isLoading: areQuestsLoading } = useQuests(nfts);

    const isLoading = useMemo(() => areNftsLoading || areQuestsLoading, [areNftsLoading, areQuestsLoading]);

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

                <DataContext.Provider value={{ isLoading, nfts, quests, clans, currentGame }}>
                    <ClanCardList />

                    <NftCardList />
                </DataContext.Provider>
            </Container>
        </>
    );
};

export default Home;
