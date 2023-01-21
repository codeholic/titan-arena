import type { WalletError } from '@solana/wallet-adapter-base';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    BackpackWalletAdapter,
    BraveWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import type { FC } from 'react';
import React, { ReactNode, useMemo } from 'react';
import toast from 'react-hot-toast';

const WalletConnectionProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const endpoint = process.env.NEXT_PUBLIC_CLUSTER_API_URL!;

    const wallets = useMemo(
        () => [
            new BackpackWalletAdapter(),
            new BraveWalletAdapter(),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [endpoint]
    );

    const onError = (error: WalletError) => toast.error(error.message ? `${error.name}: ${error.message}` : error.name);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect>
                <WalletDialogProvider>{children}</WalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletConnectionProvider;
