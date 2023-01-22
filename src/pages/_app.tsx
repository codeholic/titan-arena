import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import React, { createContext, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';

const WalletConnectionProvider = dynamic(() => import('../components/WalletConnectionProvider'), {
    ssr: false,
});

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';

import '@fontsource/teko/400.css';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

declare module '@mui/material/styles/createTypography' {
    interface TypographyOptions {
        decorative: TypographyOptions['fontFamily'];
    }
    interface Typography {
        decorative: Typography['fontFamily'];
    }
}

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

        const joinFonts = (fonts: string[]) =>
            fonts.map((font) => (font.indexOf(' ') < 0 ? font : `"${font}"`)).join(',');

        return createTheme({
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
                    fontFamily: joinFonts(['Teko', 'sans-serif']),
                    textTransform: 'uppercase',
                    fontSize: '20px',
                    letterSpacing: 2,
                },
            },
            components: {
                MuiLink: {
                    styleOverrides: {
                        root: {
                            textDecoration: 'none',
                            color: palette.text.primary,
                        },
                    },
                },
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
        </ColorModeContext.Provider>
    );
};

export default App;
