import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';

import { Box, Button, CardMedia, Container, Grid, Stack, TextField, Typography, useTheme } from '@mui/material';
import { InfoBox } from '../components/InfoBox';
import { Navbar } from '../components/Navbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRaffle } from '../hooks/useRaffle';
import { formatAmount } from '../lib/utils';
import { MYTHIC_DECIMALS } from '../lib/constants';
import { formatDistance } from 'date-fns';
import { useForm } from 'react-hook-form';

const Raffle: NextPage = () => {
    const wallet = useWallet();

    const theme = useTheme();

    const { raffle, batch, isLoading, isValidating, reload } = useRaffle(wallet.publicKey);
    const { handleSubmit, register } = useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async () => {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000)).finally(() => setIsSubmitting(false));
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

                <Navbar active="raffle" isLoading={isLoading || isValidating} reload={reload} />

                {raffle && (
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
                                    {!!raffle.endsAt && (
                                        <Box>
                                            Raffle end: {formatDistance(raffle.endsAt, new Date(), { addSuffix: true })}
                                        </Box>
                                    )}

                                    <Box>Tickets sold: {raffle.ticketsSold}</Box>

                                    {wallet.connected && <Box>Your tickets: {!batch ? 0 : batch.ticketCount}</Box>}

                                    <Box>Ticket price: {formatAmount(raffle.ticketPrice, MYTHIC_DECIMALS)} MYTHIC</Box>
                                </Typography>

                                {wallet.connected && (
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <Stack my={2} direction="row" spacing={2}>
                                            <TextField sx={{ width: '5em' }} />

                                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                                Buy tickets
                                            </Button>
                                        </Stack>
                                    </form>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default Raffle;
