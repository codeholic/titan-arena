import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import React, { createContext, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';

const WalletConnectionProvider = dynamic(() => import('../../components/WalletConnectionProvider'), {
    ssr: false,
});

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

// Use require instead of import since order matters
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    const [mode, setMode] = useState('dark');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((mode) => (mode === 'light' ? 'light' : 'dark'));
            },
        }),
        []
    );

    const theme = useMemo(() => {
        const palette: any =
            mode === 'dark'
                ? {
                      background: { default: '#2D3748' },
                      text: { primary: '#CBD5E0' },
                  }
                : {
                      background: { default: '#CBD5E0' },
                      text: { primary: '#2D3748' },
                  };

        palette.mode = mode;

        return createTheme({
            palette,
            typography: {
                fontFamily: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Oxygen-Sans',
                    'Ubuntu',
                    'Cantarell',
                    'Helvetica Neue',
                    'sans-serif',
                ].join(','),
            },
        });
    }, [mode]);

    const toastOptions = {
        duration: 5000,
    };

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Toaster position="bottom-left" toastOptions={toastOptions} />
                <WalletConnectionProvider>
                    <Component {...pageProps} />
                </WalletConnectionProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
