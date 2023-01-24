import { Box, Breakpoint, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContext } from 'react';
import { Nft } from '../hooks/useNfts';
import { NftsContext } from '../pages';
import NftCard from './NftCard';

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { nfts, isLoading } = useContext(NftsContext);

    let screen: string | undefined = undefined;

    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const mediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const smallScreen = useMediaQuery(theme.breakpoints.up('sm'));

    const columns = largeScreen ? 8 : mediumScreen ? 6 : smallScreen ? 4 : 2;

    return !wallet.connected ? (
        <Box my={2}>Connect your wallet to view baby titans.</Box>
    ) : !isLoading && nfts?.length === 0 ? (
        <Box my={2}>No baby titans owned.</Box>
    ) : (
        <Grid my={1} container spacing={2} columns={columns}>
            {(isLoading || !nfts ? Array(columns * 2).fill(undefined) : nfts).map((nft, index: number) => (
                <Grid item key={index} xs={1}>
                    {nft ? <NftCard name={`nfts.${nft.mint}`} setValue={() => {}} nft={nft} /> : <NftCard />}
                </Grid>
            ))}
        </Grid>
    );
};
