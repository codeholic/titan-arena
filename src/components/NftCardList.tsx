import CheckboxCheckedIcon from '@mui/icons-material/CheckBox';
import CheckboxBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Button, Grid, Skeleton, Stack, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { DataContext } from '../pages';
import NftCard from './NftCard';
import { toast } from 'react-hot-toast';
import { Spinner } from './Spinner';
import { RequestQuestPayload } from '../lib/types';
import requestAndExecuteTransaction from '../lib/requestAndExecuteTransaction';
import { Nft } from '@prisma/client';

export const NftCardList = () => {
    const wallet = useWallet();
    const theme = useTheme();

    const { control, register, handleSubmit, setValue, reset } = useForm();
    const { currentGame, clanStats, nfts, reload } = useContext(DataContext);

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
                      (result: Record<number, Record<string, boolean>>, { clanId, lockedAt, mint, quests }) =>
                          !quests[0]?.startedAt && !lockedAt
                              ? { [clanId]: { [mint]: true, ...(result[clanId] ? result[clanId] : {}) }, ...result }
                              : result,
                      {}
                  ),
        [nfts]
    );

    const isLocked = useMemo(() => !!nfts && !nfts.every(({ lockedAt }) => !lockedAt), [nfts]);

    const allClanSelected: Record<number, boolean> = useMemo(() => {
        return !clanStats || !Object.keys(enabledNfts).length
            ? {}
            : clanStats.reduce((result, { clanId }) => {
                  const enabledMints = Object.keys(enabledNfts[clanId] || {});

                  return {
                      [clanId]: !!enabledMints.length && enabledMints.every((mint) => selectedNfts[mint]),
                      ...result,
                  };
              }, {});
    }, [enabledNfts, clanStats, selectedNfts]);

    const toggleAllClan = useCallback(
        (clanId: number, selected: boolean) => {
            if (!nfts?.length || !Object.keys(enabledNfts[clanId] || {}).length) {
                return;
            }

            setValue(
                'nfts',
                nfts.reduce(
                    (result, nft) => ({
                        [nft.mint]: nft.clanId == clanId ? selected : selectedNfts[nft.mint],
                        ...result,
                    }),
                    {}
                )
            );
        },
        [nfts, enabledNfts, setValue, selectedNfts]
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
            {clanStats && (
                <Stack direction="row" my={2} spacing={2}>
                    {clanStats.map(({ clanId, clanName }) => (
                        <ToggleButton
                            value=""
                            selected={allClanSelected[clanId]}
                            onChange={() => toggleAllClan(clanId, !allClanSelected[clanId])}
                            disabled={!Object.keys(enabledNfts).length}
                        >
                            {allClanSelected[clanId] ? (
                                <CheckboxCheckedIcon sx={{ mr: 1 }} />
                            ) : (
                                <CheckboxBlankIcon sx={{ mr: 1 }} />
                            )}
                            {clanName}
                        </ToggleButton>
                    ))}
                </Stack>
            )}

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
                        disabled={isSubmitting || isLocked || !Object.keys(enabledNfts).length}
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
