import { Box, Button, Grid, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { NftsContext } from '../pages';
import NftCard from './NftCard';

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { register, handleSubmit, setValue } = useForm();
    const onSubmit = (data: any) => console.log(data);

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
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid my={1} container spacing={2} columns={columns}>
                {(isLoading || !nfts ? Array(columns * 2).fill(undefined) : nfts).map((nft, index: number) => (
                    <Grid item key={index} xs={1}>
                        {nft ? (
                            <NftCard nft={nft} {...register(`nfts.${nft.mint}`)} setValue={setValue} />
                        ) : (
                            <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
                        )}
                    </Grid>
                ))}
            </Grid>

            {!isLoading && (
                <Box my={2}>
                    <Button type="submit" variant="contained">
                        Submit
                    </Button>
                </Box>
            )}
        </form>
    );
};
