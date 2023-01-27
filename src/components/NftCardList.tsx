import CheckboxCheckedIcon from '@mui/icons-material/CheckBox';
import CheckboxBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
    Box,
    BoxProps,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    Grid,
    Skeleton,
    Stack,
    styled,
    ToggleButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DataContext } from '../pages';
import NftCard from './NftCard';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { BuildPaymentResult } from '../pages/api/buildPayment';

const InfoBox = styled(Box)<BoxProps>(({ theme }) => ({
    margin: '20px 0',
    padding: '50px',
    boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    fontFamily: theme.typography.button.fontFamily,
    fontSize: '20px',
    textTransform: 'uppercase',
    textAlign: 'center',
}));

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { control, register, handleSubmit, setValue } = useForm();
    const { nfts, quests, currentGame, isLoading } = useContext(DataContext);

    const selectedNfts = useWatch({ control, name: 'nfts', defaultValue: {} });

    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const mediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const smallScreen = useMediaQuery(theme.breakpoints.up('sm'));

    const columns = largeScreen ? 8 : mediumScreen ? 6 : smallScreen ? 4 : 2;

    const enabledNfts = useMemo(
        () =>
            !nfts || !quests
                ? {}
                : nfts.reduce(
                      (result: Record<string, boolean>, { mint }) =>
                          quests[mint].startedAt ? result : { [mint]: true, ...result },
                      {}
                  ),
        [nfts, quests]
    );

    const allSelected = useMemo(() => {
        const enabledMints = Object.keys(enabledNfts);

        return !!enabledMints.length && enabledMints.every((mint) => selectedNfts[mint]);
    }, [enabledNfts, selectedNfts]);

    const toggleAll = useCallback(
        (selected: boolean) => {
            if (!Object.keys(enabledNfts).length) {
                return;
            }

            setValue('nfts', selected ? enabledNfts : {});
        },
        [enabledNfts, setValue]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const mints = Object.entries(selectedNfts).reduce(
        (result, [key, value]) => (value ? [key, ...result] : result),
        [] as string[]
    );

    const onSubmit = async (data: any) => {
        if (!wallet || !nfts || mints.length === 0) {
            return;
        }

        setIsSubmitting(true);

        await fetch('/api/buildPayment', {
            method: 'POST',
            body: JSON.stringify({
                payer: wallet.publicKey?.toBase58(),
                nftCount: mints.length,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then((data) =>
                data
                    .json()
                    .catch(() => Promise.reject({ message: 'Internal server error.' }))
                    .then((result) => {
                        if (!data.ok) {
                            return Promise.reject(result);
                        }

                        const { transactionMessage, checksum } = result as BuildPaymentResult;

                        const transaction = Transaction.populate(
                            Message.from(Buffer.from(transactionMessage, 'base64')),
                            []
                        );

                        return wallet.signTransaction!(transaction).then(({ signature }) =>
                            !signature
                                ? Promise.reject('No signature.')
                                : fetch('/api/confirmPayment', {
                                      method: 'POST',
                                      body: JSON.stringify({
                                          mints,
                                          transactionMessage,
                                          checksum,
                                          signature: signature.toString('base64'),
                                      }),
                                      headers: { 'Content-Type': 'application/json' },
                                  }).then((data) =>
                                      data
                                          .json()
                                          .catch(() => Promise.reject({ message: 'Internal server error.' }))
                                          .then((result) => {
                                              if (!data.ok) {
                                                  return Promise.reject(result);
                                              }
                                          })
                                  )
                        );

                        // TODO: display spinner and success message
                    })
            )
            .catch((err) => toast.error(err.message))
            .finally(() => setIsSubmitting(false)); // TODO: refresh
    };

    return !wallet.connected ? (
        <InfoBox>Connect your wallet to view baby titans.</InfoBox>
    ) : !isLoading && nfts?.length === 0 ? (
        <InfoBox>No baby titans owned.</InfoBox>
    ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box my={2}>
                <ToggleButton
                    value=""
                    selected={allSelected}
                    onChange={() => toggleAll(!allSelected)}
                    disabled={!Object.keys(enabledNfts).length}
                >
                    {allSelected ? <CheckboxCheckedIcon sx={{ mr: 1 }} /> : <CheckboxBlankIcon sx={{ mr: 1 }} />}
                    Select all
                </ToggleButton>
            </Box>

            <Grid container spacing={2} columns={columns}>
                {(!nfts ? Array(columns * 2).fill(undefined) : nfts).map((nft, index: number) => (
                    <Grid item key={index} xs={1}>
                        {nft ? (
                            <NftCard
                                nft={nft}
                                setValue={setValue}
                                {...register(`nfts.${nft.mint}`)}
                                defaultChecked={!!selectedNfts[nft.mint]}
                                isSubmitting={isSubmitting}
                                quest={quests && quests[nft.mint]}
                            />
                        ) : (
                            <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
                        )}
                    </Grid>
                ))}
            </Grid>

            {nfts && (
                <Box my={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !Object.keys(enabledNfts).length}
                    >
                        Submit
                    </Button>
                </Box>
            )}

            <Dialog open={isSubmitting}>
                <DialogContent>
                    <Stack direction="row" spacing={1} display="flex" alignItems="center">
                        <CircularProgress size={20} />
                        <Box>Sending {mints.length} titans on a quest...</Box>
                    </Stack>
                </DialogContent>
            </Dialog>
        </form>
    );
};
