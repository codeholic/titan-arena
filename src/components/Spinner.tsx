import { Box, CircularProgress, Dialog, DialogContent, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface SpinnerProps {
    open: boolean;
    children: ReactNode;
}

export const Spinner = ({ open, children }: SpinnerProps) => (
    <Dialog open={open}>
        <DialogContent>
            <Stack direction="row" spacing={1} display="flex" alignItems="center">
                <CircularProgress size={20} />
                <Box>{children}</Box>
            </Stack>
        </DialogContent>
    </Dialog>
);
