import { CircularProgress, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

import { FC } from 'react';

export interface ReloadButtonProps {
    isLoading: boolean;
    reload: Function;
}

export const ReloadButton: FC<ReloadButtonProps> = ({ isLoading, reload }) => {
    return (
        <IconButton onClick={() => reload()} disabled={isLoading}>
            {isLoading ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
        </IconButton>
    );
};
