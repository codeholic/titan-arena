import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';

import { Box, Button, CardMedia, Container, Grid, Link, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { Message, Transaction } from '@solana/web3.js';
import { useRaffle } from '../hooks/useRaffle';
import { formatAmount } from '../lib/utils';
import { MYTHIC_DECIMALS } from '../lib/constants';
import { formatDistance } from 'date-fns';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import fetch from 'node-fetch';
import superjson from 'superjson';
import { BuildTransactionResult } from '../lib/types';
import { Spinner } from '../components/Spinner';

const Raffle: NextPage = () => {
    const wallet = useWallet();

    const theme = useTheme();

    const { raffle, batch, isLoading, isValidating, reload } = useRaffle(wallet.publicKey);
    const { control, handleSubmit, register, reset } = useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const ticketCount = useWatch({ control, name: 'ticketCount', defaultValue: 0 });

    const onSubmit = async () => {
        if (!wallet.publicKey || !raffle || ticketCount === 0) {
            return;
        }

        setIsSubmitting(true);

        const raffleId = raffle.id;
        const buyer = wallet.publicKey.toBase58();

        await fetch('/api/requestTickets', {
            method: 'POST',
            body: JSON.stringify({
                raffleId,
                ticketCount,
                buyer,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((data) =>
                data
                    .text()
                    .then(superjson.parse)
                    .catch(() => Promise.reject({ message: 'Internal server error.' }))
                    .then((result) => {
                        if (!data.ok) {
                            return Promise.reject(result);
                        }

                        const { transactionMessage, checksum } = result as BuildTransactionResult;

                        const transaction = Transaction.populate(
                            Message.from(Buffer.from(transactionMessage, 'base64')),
                            []
                        );

                        return wallet.signTransaction!(transaction).then(({ signature }) =>
                            !signature
                                ? Promise.reject('No signature.')
                                : fetch('/api/claimTickets', {
                                      method: 'POST',
                                      body: JSON.stringify({
                                          raffleId,
                                          ticketCount,
                                          transactionMessage,
                                          checksum,
                                          signature: signature.toString('base64'),
                                      }),
                                      headers: { 'Content-Type': 'application/json' },
                                  }).then((data) =>
                                      data
                                          .text()
                                          .then(superjson.parse)
                                          .catch(() => Promise.reject({ message: 'Internal server error.' }))
                                          .then((result) => {
                                              if (!data.ok) {
                                                  return Promise.reject(result);
                                              }

                                              toast.success('Tickets have been bought!');

                                              reset({ ticketCount: '' });
                                          })
                                  )
                        );
                    })
            )
            .catch((err) => toast.error(err.message))
            .finally(() => {
                setIsSubmitting(false);
                reload();
            });
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
                            <Link href={raffle.linkUrl} target="_blank">
                                <CardMedia image={raffle.imageUrl} sx={{ aspectRatio: '1/1', borderRadius: '20px' }} />
                            </Link>
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

                                    <Box>Ticket price: {formatAmount(raffle.ticketPrice, MYTHIC_DECIMALS)} DUSA</Box>
                                </Typography>

                                {wallet.connected && (
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <Stack my={2} direction="row" spacing={2}>
                                            <TextField sx={{ width: '5em' }} {...register(`ticketCount`)} />

                                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                                Buy tickets
                                            </Button>
                                        </Stack>
                                    </form>
                                )}

                                <Spinner open={isSubmitting}>Tickets are being bought...</Spinner>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default Raffle;
