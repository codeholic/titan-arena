import { CircularProgress, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

import { useContext, FC } from 'react';

import { DataContext } from '../pages';

export const ReloadButton: FC<{}> = () => {
    const { isLoading, reload } = useContext(DataContext);

    return (
        <IconButton onClick={() => reload()} disabled={isLoading}>
            {isLoading ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
        </IconButton>
    );
};
