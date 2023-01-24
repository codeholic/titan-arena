import { Box, Grid, CardMedia, Skeleton } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { Nft, useNfts } from '../hooks/useNfts';
import { NftCard } from './NftCard';

export const NftCardList = () => {
    const wallet = useWallet();
    const { nfts, isLoading } = useNfts();

    return !wallet.connected ? (
        <Box my={2}>Connect your wallet to view NFTs.</Box>
    ) : (
        <Grid my={1} container spacing={2} columns={{ xs: 2, sm: 4, md: 6, lg: 8 }}>
            {!isLoading
                ? nfts &&
                  nfts.length > 0 &&
                  nfts.map((nft: Nft, index: number) => (
                      <Grid item key={index} xs={1}>
                          <NftCard nft={nft} />
                      </Grid>
                  ))
                : Array(16)
                      .fill(undefined)
                      .map((_, index) => (
                          <Grid item key={index} xs={1}>
                              <Skeleton key={index} variant="rounded" sx={{ paddingTop: '100%' }} />
                          </Grid>
                      ))}
        </Grid>
    );
};
