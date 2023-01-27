import { Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { DataContext } from '../pages';
import { NftCardList } from './NftCardList';

export const QuestWidget = () => {
    const { quests } = useContext(DataContext);

    return (
        <>
            {quests && (
                <Box my={2} p={4} sx={{ boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)', borderRadius: '5px' }}>
                    <Typography variant="h2" sx={{ lineHeight: '100%' }}>
                        {"Gladiator's Arena"}
                    </Typography>

                    <Typography variant="subtitle1" mb={2}>
                        {'Multiplier: 100%'}
                    </Typography>

                    <Typography variant="body1">
                        {'Use your combat skills to fight and survive as a gladiator in the arenas of ancient Greece.'}
                    </Typography>

                    <NftCardList />
                </Box>
            )}
        </>
    );
};
