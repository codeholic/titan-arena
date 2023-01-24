import React from 'react';
import dynamic from 'next/dynamic';

import { Box, Stack } from '@mui/material';

import BackIcon from '@mui/icons-material/Reply';
import CupIcon from '@mui/icons-material/EmojiEvents';
import VestingIcon from '@mui/icons-material/AccountBalance';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);

import { MenuItem, MenuItemProps } from './MenuItem';

export const Navbar = () => {
    const menuItemProps: MenuItemProps[] = [
        {
            href: 'https://dashboard.titanarena.app',
            icon: <BackIcon sx={{ mr: 1, mb: '5px' }} />,
            children: 'Dashboard',
        },
        {
            href: '/',
            icon: <CupIcon sx={{ mr: 1, mb: '5px' }} />,
            isActive: true,
            children: 'Quests',
        },
    ];

    return (
        <Stack
            px={4}
            py={2}
            spacing={4}
            direction="row"
            alignItems="center"
            sx={{
                boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                borderRadius: '0.375rem',
                backgroundImage: 'linear-gradient(to right, rgb(83, 153, 141), rgb(110, 45, 167))',
            }}
        >
            {menuItemProps.map((props, index) => {
                return index < menuItemProps.length - 1 ? (
                    <MenuItem key={index} {...props} />
                ) : (
                    <Box key={index} sx={{ flexGrow: 1 }}>
                        <MenuItem {...props} />
                    </Box>
                );
            })}

            <Box>
                <WalletMultiButtonDynamic />
            </Box>
        </Stack>
    );
};
