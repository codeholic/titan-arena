import { CardMedia, Grid, useTheme } from '@mui/material';
import { useContext } from 'react';
import { DataContext } from '../pages';

export const ClanCardList = () => {
    const theme = useTheme();

    const { clanStats } = useContext(DataContext);

    if (!clanStats) {
        return null;
    }

    return (
        <Grid container columns={{ xs: 2, md: 4 }} my={1} spacing={2}>
            {clanStats.map(({ clanName, clanMultiplier, total, played, points }) => (
                <Grid key={clanName} item xs={1}>
                    <CardMedia
                        image={`/i/clans/${clanName.toLowerCase()}.png`}
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
                                {clanName}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Multiplier:
                            </Grid>
                            <Grid item xs={1}>
                                {clanMultiplier * 100}%
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Total:
                            </Grid>
                            <Grid item xs={1}>
                                {/* FIXME: https://github.com/facebook/react/pull/24580 */ String(total)}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Questing:
                            </Grid>
                            <Grid item xs={1}>
                                {/* FIXME: https://github.com/facebook/react/pull/24580 */ String(played)}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Points:
                            </Grid>
                            <Grid item xs={1}>
                                {/* FIXME: https://github.com/facebook/react/pull/24580 */ String(points)}
                            </Grid>
                        </Grid>
                    </CardMedia>
                </Grid>
            ))}
        </Grid>
    );
};
