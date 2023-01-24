import { Box, Breakpoint, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContext } from 'react';
import { Nft } from '../hooks/useNfts';
import { NftsContext } from '../pages';
import { NftCard } from './NftCard';

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { nfts, isLoading } = useContext(NftsContext);

    const screen =
        ['lg', 'md', 'sm'].reduce(
            (result: string | undefined, screen) =>
                useMediaQuery(theme.breakpoints.up(screen as Breakpoint)) ? result || screen : result,
            undefined
        ) || 'xs';

    const columns = { xs: 2, sm: 4, md: 6, lg: 8 }[screen];

    return !wallet.connected ? (
        <Box my={2}>Connect your wallet to view baby titans.</Box>
    ) : !isLoading && nfts?.length === 0 ? (
        <Box my={2}>No baby titans owned.</Box>
    ) : (
        <Grid my={1} container spacing={2} columns={columns}>
            {(isLoading || !nfts ? Array(columns * 2).fill(undefined) : nfts).map((nft: Nft, index: number) => (
                <Grid item key={index} xs={1}>
                    <NftCard nft={nft} />
                </Grid>
            ))}
        </Grid>
    );
};
