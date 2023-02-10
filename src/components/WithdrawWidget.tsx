import { Box, Button, Stack } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useContext } from 'react';
import { MYTHIC_DECIMALS } from '../lib/constants';
import { formatAmount } from '../lib/utils';
import { DataContext } from '../pages';

export const WithdrawWidget = () => {
    const wallet = useWallet();

    const { pendingReward } = useContext(DataContext);

    const withdraw = () => {};
    const reward = 1000;

    return wallet.connected ? (
        <Stack spacing={1}>
            <Box>Your reward: {formatAmount(pendingReward || BigInt(0), MYTHIC_DECIMALS)} MYTHIC</Box>
            <Box>
                <Button variant="contained" onClick={withdraw} disabled={!reward}>
                    Claim
                </Button>
            </Box>
        </Stack>
    ) : (
        <Box>Connect wallet to claim reward.</Box>
    );
};
