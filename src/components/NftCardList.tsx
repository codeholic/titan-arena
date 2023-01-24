import CheckboxCheckedIcon from '@mui/icons-material/CheckBox';
import CheckboxBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Button, Grid, Skeleton, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Nft } from '../hooks/useNfts';
import { NftsContext } from '../pages';
import NftCard from './NftCard';

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { control, register, handleSubmit, setValue } = useForm();
    const onSubmit = (data: any) => console.log(data);

    const { nfts, isLoading } = useContext(NftsContext);

    const selectedNfts = useWatch({ control, name: 'nfts', defaultValue: {} });

    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const mediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const smallScreen = useMediaQuery(theme.breakpoints.up('sm'));

    const columns = largeScreen ? 8 : mediumScreen ? 6 : smallScreen ? 4 : 2;

    const allSelected = useMemo(() => {
        if (!nfts) {
            return;
        }

        // console.log(Object.entries(selectedNfts).reduce((result, [key, value]) => (value ? [key, ...result] : result), []));

        return Object.values(selectedNfts).every(value => value);
    }, [nfts, selectedNfts]);

    const toggleAll = (selected: boolean) => {
        if (!nfts) {
            return;
        }

        setValue('nfts', nfts.reduce((result, { mint }) => ({ [mint]: selected, ...result }), {}));
    };

    return !wallet.connected ? (
        <Box my={2}>Connect your wallet to view baby titans.</Box>
    ) : !isLoading && nfts?.length === 0 ? (
        <Box my={2}>No baby titans owned.</Box>
    ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box my={2}>
                <ToggleButton value="" selected={allSelected} onChange={() => toggleAll(!allSelected)}>
                    {allSelected ? <CheckboxCheckedIcon sx={{ mr: 1 }} /> : <CheckboxBlankIcon sx={{ mr: 1 }} />}
                    Select all
                </ToggleButton>
            </Box>
            <Grid container spacing={2} columns={columns}>
                {(!nfts ? Array(columns * 2).fill(undefined) : nfts).map((nft, index: number) => (
                    <Grid item key={index} xs={1}>
                        {nft ? (
                            <NftCard nft={nft} setValue={setValue} {...register(`nfts.${nft.mint}`)} defaultChecked={!!selectedNfts[nft.mint]} />
                        ) : (
                            <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
                        )}
                    </Grid>
                ))}
            </Grid>

            {nfts && (
                <Box my={2}>
                    <Button type="submit" variant="contained">
                        Submit
                    </Button>
                </Box>
            )}
        </form>
    );
};
