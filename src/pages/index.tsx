import type { NextPage } from 'next';
import Head from 'next/head';
import React, { createContext, useCallback, useMemo } from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { useCurrentGame, UseCurrentGameResult } from '../hooks/useCurrentGame';
import { ClanCardList } from '../components/ClanCardList';
import { QuestWidget } from '../components/QuestWidget';
import { useWallet } from '@solana/wallet-adapter-react';

export type DataContextProps = UseCurrentGameResult;

export const DataContext = createContext({
    currentGame: undefined,
    clanStats: undefined,
    isLoading: false,
    nfts: undefined,
    playerStats: undefined,
    reload: () => {},
} as DataContextProps);

const Home: NextPage = () => {
    const wallet = useWallet();
    const context = useCurrentGame(wallet?.publicKey);

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

                <Navbar active="quests" isLoading={context.isLoading} reload={context.reload} />

                <DataContext.Provider value={context}>
                    <ClanCardList />

                    <QuestWidget />
                </DataContext.Provider>
            </Container>
        </>
    );
};

export default Home;
