import { Box, Grid, CardMedia, Skeleton } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNfts } from '../hooks/useNfts';

export const NftList = () => {
    const wallet = useWallet();
    const { nfts, isLoading } = useNfts();

    return !wallet.connected ? (
        <Box my={2}>Connect your wallet to see your NFTs.</Box>
    ) : (
        <Grid my={1} container spacing={2} columns={{ xs: 2, sm: 4, md: 6, lg: 8 }}>
            {!isLoading
                ? nfts &&
                  nfts.map(({ image_url }: any, index: number) => (
                      <Grid item key={index} xs={1}>
                          <CardMedia component="img" image={image_url} sx={{ borderRadius: '5px' }} />
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
