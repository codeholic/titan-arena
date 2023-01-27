import type { NextPage } from 'next';
import Head from 'next/head';
import React, { createContext, useCallback, useMemo } from 'react';

import { CardMedia, Container } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { useNfts } from '../hooks/useNfts';
import { Clan, Game, Nft, Quest } from '../lib/types';
import { useQuests } from '../hooks/useQuests';
import { useCurrentGame } from '../hooks/useCurrentGame';
import { ClanCardList } from '../components/ClanCardList';
import { useClans } from '../hooks/useClans';
import { QuestWidget } from '../components/QuestWidget';

export type DataContextProps = {
    isLoading: boolean;
    nfts?: Nft[];
    quests?: Record<string, Quest>;
    clans?: Clan[];
    currentGame?: Game;
    reload: Function;
};

export const DataContext = createContext({
    isLoading: false,
    nfts: undefined,
    quests: undefined,
    clans: undefined,
    currentGame: undefined,
} as DataContextProps);

const Home: NextPage = () => {
    const { nfts, isLoading: areNftsLoading, reload: reloadNfts } = useNfts();
    const { quests, isLoading: areQuestsLoading, mutate: reloadQuests } = useQuests(nfts);
    const { currentGame, isLoading: isCurrentGameLoading, mutate: reloadCurrentGame } = useCurrentGame();
    const { clans, isLoading: areClansLoading, mutate: reloadClans } = useClans();

    const isLoading = useMemo(
        () => areNftsLoading || areQuestsLoading || isCurrentGameLoading || areClansLoading,
        [areNftsLoading, areQuestsLoading, isCurrentGameLoading, areClansLoading]
    );

    const reload = useCallback(() => {
        reloadNfts();
        reloadQuests();
        reloadCurrentGame();
        reloadClans();
    }, [reloadNfts, reloadQuests, reloadCurrentGame, reloadClans]);

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

                <DataContext.Provider value={{ isLoading, nfts, quests, clans, currentGame, reload }}>
                    <Navbar />

                    <ClanCardList />

                    <QuestWidget />
                </DataContext.Provider>
            </Container>
        </>
    );
};

export default Home;
