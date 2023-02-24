import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';

import { Box, CardMedia, Container, Grid, Typography, useTheme } from '@mui/material';
import { InfoBox } from '../components/InfoBox';
import { Navbar } from '../components/Navbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffle } from '../hooks/useRaffle';
import { formatAmount } from '../lib/utils';
import { MYTHIC_DECIMALS } from '../lib/constants';
import { formatDistance } from 'date-fns';

const Raffle: NextPage = () => {
    const wallet = useWallet();

    const theme = useTheme();

    const { raffle, batch, isLoading, reload } = useRaffle(wallet.publicKey);

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

                {!raffle ? (
                    <InfoBox>Our next raffle is coming soon, stay tuned!</InfoBox>
                ) : (
                    <Grid container my={1} columns={{ xs: 1, sm: 2 }} spacing={2}>
                        <Grid item xs={1}>
                            <CardMedia image={raffle.imageUrl} sx={{ aspectRatio: '1/1', borderRadius: '5px' }} />
                        </Grid>
                        <Grid item xs={1}>
                            <Box
                                sx={{
                                    boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.375rem',
                                    padding: 2,
                                    height: '100%',
                                }}
                            >
                                <Typography variant="h2">{raffle.displayName}</Typography>

                                <Typography
                                    sx={{
                                        fontFamily: theme.typography.button,
                                        fontSize: '20px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    <Box>Ticket price: {formatAmount(raffle.ticketPrice, MYTHIC_DECIMALS)} MYTHIC</Box>

                                    <Box>Tickets sold: {raffle.ticketsSold}</Box>

                                    {!!batch && <Box>Your tickets: {batch.ticketCount}</Box>}

                                    {!!raffle.endsAt && (
                                        <Box>
                                            Raffle end: {formatDistance(raffle.endsAt, new Date(), { addSuffix: true })}
                                        </Box>
                                    )}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default Raffle;
