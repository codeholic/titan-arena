import React from 'react';
import dynamic from 'next/dynamic';

import { Box, Stack } from '@mui/material';

import BackIcon from '@mui/icons-material/Reply';
import PartyPopperIcon from '@mui/icons-material/Celebration';
import CupIcon from '@mui/icons-material/EmojiEvents';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-material-ui')).WalletMultiButton,
    { ssr: false }
);

import { MenuItem, MenuItemProps } from './MenuItem';
import { ReloadButton, ReloadButtonProps } from './ReloadButton';

interface NavbarProps extends ReloadButtonProps {
    active: string;
}

export const Navbar = ({ active, ...props }: NavbarProps) => {
    const menuItemProps: MenuItemProps[] = [
        {
            href: 'https://dashboard.titanarena.app',
            icon: <BackIcon sx={{ mr: 1, mb: '5px' }} />,
            children: 'Dashboard',
        },
        {
            name: 'quests',
            href: '/',
            icon: <CupIcon sx={{ mr: 1, mb: '5px' }} />,
            children: 'Quests',
        },
        {
            name: 'raffle',
            href: '/raffle',
            icon: <PartyPopperIcon sx={{ mr: 1, mb: '5px' }} />,
            children: 'Raffle',
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
                props = { isActive: active === props.name, ...props };

                return index < menuItemProps.length - 1 ? (
                    <MenuItem key={index} {...props} />
                ) : (
                    <Box key={index} sx={{ flexGrow: 1 }}>
                        <MenuItem {...props} />
                    </Box>
                );
            })}

            <Stack direction="row" spacing={1}>
                <ReloadButton {...props} />

                <WalletMultiButtonDynamic />
            </Stack>
        </Stack>
    );
};
