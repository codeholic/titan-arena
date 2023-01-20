import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    BackpackWalletAdapter,
    BraveWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import type { FC } from 'react';
import React, { ReactNode, useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

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
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletConnectionProvider;
