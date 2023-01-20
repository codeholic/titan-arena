import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import React from 'react';

const WalletConnectionProvider = dynamic(() => import('../../components/WalletConnectionProvider'), {
    ssr: false,
});
// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <WalletConnectionProvider>
            <Component {...pageProps} />
        </WalletConnectionProvider>
    );
};

export default App;
