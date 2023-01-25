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

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletDialogProvider featuredWallets={wallets.length}>{children}</WalletDialogProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletConnectionProvider;
