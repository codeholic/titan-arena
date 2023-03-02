import CheckboxCheckedIcon from '@mui/icons-material/CheckBox';
import CheckboxBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Button, Grid, Skeleton, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DataContext } from '../pages';
import NftCard from './NftCard';
import { toast } from 'react-hot-toast';
import { Spinner } from './Spinner';
import { RequestQuestPayload } from '../lib/types';
import requestAndExecuteTransaction from '../lib/requestAndExecuteTransaction';

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { control, register, handleSubmit, setValue, reset } = useForm();
    const { currentGame, nfts, reload } = useContext(DataContext);

    const selectedNfts = useWatch({ control, name: 'nfts', defaultValue: {} });

    const largeScreen = useMediaQuery(theme.breakpoints.up('md'));
    const mediumScreen = useMediaQuery(theme.breakpoints.up('md'));
    const smallScreen = useMediaQuery(theme.breakpoints.up('sm'));

    const columns = largeScreen ? 8 : mediumScreen ? 6 : smallScreen ? 4 : 2;

    const enabledNfts = useMemo(
        () =>
            !nfts
                ? {}
                : nfts.reduce(
                      (result: Record<string, boolean>, { mint, lockedAt, quests }) =>
                          !quests[0]?.startedAt && !lockedAt ? { [mint]: true, ...result } : result,
                      {}
                  ),
        [nfts]
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
        if (!wallet || !nfts || !currentGame || mints.length === 0) {
            return;
        }

        setIsSubmitting(true);

        const payload: RequestQuestPayload = {
            gameId: currentGame.id,
            mints,
        };

        await requestAndExecuteTransaction({
            wallet,
            requestEndpoint: '/api/requestQuest',
            executeEndpoint: '/api/claimQuest',
            payload,
        })
            .then(() => {
                toast.success('Titans have embarked on a quest!');

                setTimeout(() => reset({ nfts: {} }), 100);
            })
            .catch((err) => toast.error(err.message))
            .finally(() => {
                setIsSubmitting(false);
                reload();
            });
    };

    return (
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
                            />
                        ) : (
                            <Skeleton variant="rounded" sx={{ paddingTop: '100%' }} />
                        )}
                    </Grid>
                ))}
            </Grid>

            {nfts && (
                <Box mt={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !Object.keys(enabledNfts).length}
                    >
                        Submit
                    </Button>
                </Box>
            )}

            <Spinner open={isSubmitting}>
                Sending {mints.length > 1 ? `${mints.length} titans` : 'a titan'} on a quest&hellip;
            </Spinner>
        </form>
    );
};
