import { Box, BoxProps, styled } from '@mui/material';

export const InfoBox = styled(Box)<BoxProps>(({ theme }) => ({
    margin: '20px 0',
    padding: '50px',
    boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    fontFamily: theme.typography.button.fontFamily,
    fontSize: '20px',
    textTransform: 'uppercase',
    textAlign: 'center',
}));
