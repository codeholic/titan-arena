import NextLink from 'next/link';
import React, { ReactNode } from 'react';

import { Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export type MenuItemProps = {
    name?: string;
    href: string;
    icon: ReactNode;
    isActive?: boolean;
    children: ReactNode;
};

export const MenuItem = ({ href, icon, isActive, children }: MenuItemProps) => {
    const theme = useTheme();

    return (
        <NextLink href={href} passHref>
            <Link sx={{ display: 'inline-flex', ...(isActive ? { color: '#F7FAFC' } : {}) }} alignItems="center">
                {icon}
                <Typography
                    sx={{
                        fontFamily: theme.typography.button,
                        fontSize: '20px',
                        letterSpacing: 2,
                    }}
                >
                    {children}
                </Typography>
            </Link>
        </NextLink>
    );
};
