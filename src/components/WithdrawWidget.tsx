import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContext, useMemo, useState } from 'react';
import { MYTHIC_DECIMALS } from '../lib/constants';
import { formatAmount } from '../lib/utils';
import { DataContext } from '../pages';
import { toast } from 'react-hot-toast';
import { Spinner } from './Spinner';
import { RequestRewardPayload } from '../lib/types';
import requestAndExecuteTransaction from '../lib/requestAndExecuteTransaction';

export const WithdrawWidget = () => {
    const wallet = useWallet();

    const { nfts, pendingReward, reload } = useContext(DataContext);

    const mints = useMemo(() => nfts && nfts.map(({ mint }) => mint), [nfts]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLocked = useMemo(() => !!nfts && !nfts.every(({ lockedAt }) => !lockedAt), [nfts]);

    const withdraw = async (mints?: string[]) => {
        if (!wallet.connected || !mints) {
            return;
        }

        setIsSubmitting(true);

        const payload: RequestRewardPayload = {
            mints,
        };

        await requestAndExecuteTransaction({
            wallet,
            requestEndpoint: '/api/requestReward',
            executeEndpoint: '/api/claimReward',
            payload,
        })
            .then(() => toast.success('Reward has been claimed!'))
            .catch(({ message }) => toast.error(message))
            .finally(() => {
                setIsSubmitting(false);

                reload();
            });
    };

    return wallet.connected ? (
        <Stack spacing={1}>
            <Box>Your reward: {formatAmount(pendingReward || BigInt(0), MYTHIC_DECIMALS)} MYTHIC</Box>
            <Box>
                {!isLocked ? (
                    <Button variant="contained" onClick={() => withdraw(mints)} disabled={!pendingReward}>
                        Claim
                    </Button>
                ) : (
                    <CircularProgress />
                )}
            </Box>

            <Spinner open={isSubmitting}>Reward is being claimed...</Spinner>
        </Stack>
    ) : (
        <Box>Connect wallet to claim reward.</Box>
    );
};
