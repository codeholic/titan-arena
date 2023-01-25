import CheckboxCheckedIcon from '@mui/icons-material/CheckBox';
import CheckboxBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Button, Grid, Skeleton, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useContext, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { NftsContext } from '../pages';
import NftCard from './NftCard';
import { Message, PublicKey, Transaction } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { BuildStakeTransactionsData, TransactionData } from '../pages/api/buildStakeTransactions';

export const NftCardList = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const theme = useTheme();

    const { control, register, handleSubmit, setValue } = useForm();
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

        return Object.values(selectedNfts).every((value) => value);
    }, [nfts, selectedNfts]);

    const toggleAll = (selected: boolean) => {
        if (!nfts) {
            return;
        }

        setValue(
            'nfts',
            nfts.reduce((result, { mint }) => ({ [mint]: selected, ...result }), {})
        );
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const authority = new PublicKey(process.env.NEXT_PUBLIC_AUTHORITY_PUBLIC_KEY!);

    const onSubmit = async (data: any) => {
        if (!wallet || !nfts || !Object.keys(selectedNfts).length) {
            return;
        }

        setIsSubmitting(true);

        await fetch('/api/buildStakeTransactions', {
            method: 'POST',
            body: JSON.stringify({
                wallet: wallet.publicKey?.toBase58(),
                mints: nfts.reduce(
                    (result: string[], { mint }) => (selectedNfts[mint] ? [mint, ...result] : result),
                    []
                ),
            }),
        })
            .then((data) =>
                data
                    .json()
                    .catch(() => Promise.reject({ message: 'Internal server error.' }))
                    .then((payload: BuildStakeTransactionsData) => {
                        if (!data.ok) {
                            return Promise.reject(payload);
                        }

                        const [transactions, signatures] = payload.transactionData.reduce(
                            ([transactions, signatures], transactionData: TransactionData) => [
                                [
                                    Transaction.populate(
                                        Message.from(Buffer.from(transactionData.message!, 'base64')),
                                        []
                                    ),
                                    ...transactions,
                                ],
                                [Buffer.from(transactionData.signature, 'base64'), ...signatures],
                            ],
                            [[] as Transaction[], [] as Buffer[]]
                        );

                        return wallet.signAllTransactions!(transactions).then(
                            (transactions) =>
                                Promise.all(
                                    transactions.map((transaction, index) => {
                                        transaction.addSignature(authority, signatures[index]);

                                        return connection.sendRawTransaction(transaction.serialize());
                                    })
                                )
                            // TODO: confirm transactions and display success message
                        );
                    })
            )
            .catch((err) => toast.error(err.message))
            .finally(() => setIsSubmitting(false));
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
                            <NftCard
                                nft={nft}
                                setValue={setValue}
                                {...register(`nfts.${nft.mint}`)}
                                defaultChecked={!!selectedNfts[nft.mint]}
                            />
                        ) : (
                            <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
                        )}
                    </Grid>
                ))}
            </Grid>

            {nfts && (
                <Box my={2}>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        Submit
                    </Button>
                </Box>
            )}
        </form>
    );
};
