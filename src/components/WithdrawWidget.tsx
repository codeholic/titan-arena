import { Box, Button, Stack } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { Message, Transaction } from '@solana/web3.js';
import { useContext, useMemo, useState } from 'react';
import { MYTHIC_DECIMALS } from '../lib/constants';
import { formatAmount } from '../lib/utils';
import { DataContext } from '../pages';
import superjson from 'superjson';
import { toast } from 'react-hot-toast';
import { Spinner } from './Spinner';

export const WithdrawWidget = () => {
    const wallet = useWallet();

    const { nfts, pendingReward, reload } = useContext(DataContext);

    const mints = useMemo(() => nfts && nfts.map(({ mint }) => mint), [nfts]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const withdraw = async (mints?: string[]) => {
        if (!wallet.connected || !mints) {
            return;
        }

        setIsSubmitting(true);

        const claimedAt = new Date();

        await fetch('/api/requestReward', {
            body: JSON.stringify({
                claimedAt,
                mints,
                player: wallet.publicKey!.toBase58(),
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })
            .then((data) =>
                data
                    .text()
                    .then(superjson.parse)
                    .catch(() => Promise.reject({ message: 'Internal server error.' }))
                    .then((result) => {
                        if (!data.ok) {
                            return Promise.reject(result);
                        }

                        const { transactionMessage, checksum } = result as {
                            transactionMessage: string;
                            checksum: string;
                        };

                        const transaction = Transaction.populate(
                            Message.from(Buffer.from(transactionMessage, 'base64')),
                            []
                        );

                        return wallet.signTransaction!(transaction).then(({ signature }) =>
                            !signature
                                ? Promise.reject('No signature.')
                                : fetch('/api/claimReward', {
                                      method: 'POST',
                                      body: JSON.stringify({
                                          checksum,
                                          claimedAt,
                                          mints,
                                          signature: signature.toString('base64'),
                                          transactionMessage,
                                      }),
                                      headers: { 'Content-Type': 'application/json' },
                                  }).then((data) =>
                                      data
                                          .text()
                                          .then(superjson.parse)
                                          .catch(() => Promise.reject({ message: 'Internal server error.' }))
                                          .then((result) => {
                                              if (!data.ok) {
                                                  return Promise.reject(result);
                                              }

                                              toast.success('Reward has been claimed!');
                                          })
                                  )
                        );
                    })
            )
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
                <Button variant="contained" onClick={() => withdraw(mints)} disabled={!pendingReward}>
                    Claim
                </Button>
            </Box>

            <Spinner open={isSubmitting}>Reward is being claimed...</Spinner>
        </Stack>
    ) : (
        <Box>Connect wallet to claim reward.</Box>
    );
};
