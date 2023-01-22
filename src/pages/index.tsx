import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';

import { Box, CardMedia, Container, Link, Stack, Typography } from '@mui/material';
import BackIcon from '@mui/icons-material/Reply';
import ArenaIcon from '@mui/icons-material/Stadium';
import VestingIcon from '@mui/icons-material/AccountBalance';
import { useTheme } from '@mui/material/styles';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);

const Home: NextPage = () => {
    const theme = useTheme();

    return (
        <>
            <Head>
                <title>Titan Arena</title>
                <meta name="description" content="Titan Arena: Rise to immortality" />
                <link rel="icon" href="/i/dusa.png" />
            </Head>

            <Box>
                <Container maxWidth="lg">
                    <CardMedia
                        component="img"
                        image="/i/logo.png"
                        sx={{ maxWidth: { lg: '500px', xs: '50%' }, mx: 'auto', my: { lg: '40px', xs: '25px' } }}
                    />

                    <Stack
                        px={4}
                        py={2}
                        spacing={4}
                        direction="row"
                        alignItems="center"
                        sx={{
                            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.375rem',
                            backgroundImage: 'linear-gradient(to right, rgb(83, 153, 141), rgb(110, 45, 167))',
                        }}
                    >
                        <Link
                            sx={{ display: 'inline-flex' }}
                            alignItems="center"
                            href="https://dashboard.titanarena.app"
                        >
                            <BackIcon sx={{ mr: 1, mb: '5px' }} />
                            <Typography
                                sx={{
                                    fontFamily: theme.typography.button,
                                    fontSize: '20px',
                                    letterSpacing: 2,
                                }}
                            >
                                Dashboard
                            </Typography>
                        </Link>

                        <Link sx={{ display: 'inline-flex', color: '#F7FAFC' }} alignItems="center" href="/">
                            <ArenaIcon sx={{ mr: 1, mb: '5px' }} />
                            <Typography
                                sx={{
                                    fontFamily: theme.typography.button,
                                    fontSize: '20px',
                                    letterSpacing: 2,
                                }}
                            >
                                Arena
                            </Typography>
                        </Link>

                        <Box sx={{ flexGrow: 1 }}>
                            <Link sx={{ display: 'inline-flex' }} alignItems="center" href="/vesting">
                                <VestingIcon sx={{ mr: 1, mb: '5px' }} />
                                <Typography
                                    sx={{
                                        fontFamily: theme.typography.button,
                                        fontSize: '20px',
                                        letterSpacing: 2,
                                    }}
                                >
                                    Vesting
                                </Typography>
                            </Link>
                        </Box>

                        <Box>
                            <WalletMultiButtonDynamic />
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Home;
