import { Box, CardMedia, Grid, Stack, useTheme } from '@mui/material';
import { useContext } from 'react';
import { DataContext } from '../pages';

export const ClanCardList = () => {
    const theme = useTheme();

    const { clans, currentGame } = useContext(DataContext);

    if (!clans || !currentGame) {
        return null;
    }

    return (
        <Grid container columns={{ xs: 2, md: 4 }} my={1} spacing={2}>
            {clans.map(({ name, multiplier, nftCount }) => (
                <Grid key={name} item xs={1}>
                    <CardMedia
                        image={`/i/clans/${name.toLowerCase()}.png`}
                        sx={{
                            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.375rem',
                            aspectRatio: '5/6',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '65%',
                            backgroundPosition: 'bottom left 50%',
                            backgroundColor: '#322659',
                            padding: 2,
                        }}
                    >
                        <Grid
                            container
                            columns={{ xs: 2 }}
                            sx={{ fontFamily: theme.typography.button, fontSize: '20px', lineHeight: '100%' }}
                        >
                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Clan:
                            </Grid>
                            <Grid item xs={1}>
                                {name}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Count:
                            </Grid>
                            <Grid item xs={1}>
                                {nftCount}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Multiplier:
                            </Grid>
                            <Grid item xs={1}>
                                {multiplier * 100}%
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Questing:
                            </Grid>
                            <Grid item xs={1}>
                                {currentGame.questCounts[name.toLowerCase()]}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Points:
                            </Grid>
                            <Grid item xs={1}>
                                {currentGame.scores[name.toLowerCase()]}
                            </Grid>
                        </Grid>
                    </CardMedia>
                </Grid>
            ))}
        </Grid>
    );
};
