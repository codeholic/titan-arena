import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const WalletConnectionProvider = dynamic(() => import('../components/WalletConnectionProvider'), {
    ssr: false,
});

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';

import '@fontsource/teko/400.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    const palette: any = {
        background: { default: '#2D3748' },
        text: { primary: '#CBD5E0' },
        mode: 'dark',
    };

    const joinFonts = (fonts: string[]) => fonts.map((font) => (font.indexOf(' ') < 0 ? font : `"${font}"`)).join(',');
    const teko = joinFonts(['Teko', 'sans-serif']);

    const theme = createTheme({
        palette,
        typography: {
            fontFamily: joinFonts([
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                'Roboto',
                'Oxygen-Sans',
                'Ubuntu',
                'Cantarell',
                'Helvetica Neue',
                'sans-serif',
            ]),
            button: {
                fontFamily: teko,
                textTransform: 'uppercase',
                fontSize: '16px',
                letterSpacing: 2,
            },
            h2: {
                fontFamily: teko,
                textTransform: 'uppercase',
                letterSpacing: 2,
            },
            subtitle1: {
                fontStyle: 'italic',
            },
        },
        components: {
            MuiLink: {
                styleOverrides: {
                    root: {
                        textDecoration: 'none',
                        color: palette.text.primary,
                        ':hover': {
                            color: '#F7FAFC',
                        },
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#1A365D !important',
                        fontFamily: teko,
                        textTransform: 'uppercase',
                    },
                },
            },
        },
    });

    const toastOptions = {
        duration: 5000,
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    body: {
                        backgroundColor: 'rgb(16, 16, 16)',
                        backgroundImage: 'url(/i/banner.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100%',
                        backgroundPosition: '50% -50px',
                    },
                }}
            />
            <Toaster position="bottom-left" toastOptions={toastOptions} />
            <WalletConnectionProvider>
                <Component {...pageProps} />
            </WalletConnectionProvider>
        </ThemeProvider>
    );
};

export default App;
