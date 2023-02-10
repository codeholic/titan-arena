import { CardMedia, Grid, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { formatAmount, getEarnings } from '../lib/utils';
import { DataContext } from '../pages';
import { WithdrawWidget } from './WithdrawWidget';
import { MYTHIC_DECIMALS, SOL_DECIMALS } from '../lib/constants';

export const ClanCardList = () => {
    const theme = useTheme();

    const { clanStats, playerStats, currentGame } = useContext(DataContext);

    if (!clanStats || !currentGame) {
        return null;
    }

    const { totalPaid, totalEarned, clanEarnings, firstPlace, lastPlace, playerPaid, playerEarnings, playerEarned } =
        getEarnings(clanStats, playerStats);

    return (
        <Grid container columns={{ xs: 2, md: 4 }} my={1} spacing={2}>
            <Grid item xs={2}>
                <Box
                    sx={{
                        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.375rem',
                        padding: 2,
                        backgroundColor: '#322659',
                        height: '100%',
                    }}
                >
                    <Grid
                        container
                        columns={{ xs: 2 }}
                        sx={{ fontFamily: theme.typography.button, fontSize: '20px', lineHeight: '100%' }}
                    >
                        <Grid item xs={1} sx={{ pr: 1 }}>
                            Game Start:
                        </Grid>
                        <Grid item xs={1}>
                            {currentGame.startsAt.toLocaleString('en-US')}
                        </Grid>

                        <Grid item xs={1} sx={{ pr: 1 }}>
                            Game End:
                        </Grid>
                        <Grid item xs={1}>
                            {currentGame.endsAt.toLocaleString('en-US')}
                        </Grid>

                        <Grid item xs={1} sx={{ pr: 1 }}>
                            SOL Collected:
                        </Grid>
                        <Grid item xs={1}>
                            {playerPaid !== undefined ? formatAmount(playerPaid, SOL_DECIMALS) : '?'}/
                            {formatAmount(totalPaid, SOL_DECIMALS)}
                        </Grid>

                        <Grid item xs={1} sx={{ pr: 1 }}>
                            MYTHIC To Be Emitted:
                        </Grid>
                        <Grid item xs={1}>
                            {playerEarned !== undefined ? formatAmount(playerEarned, MYTHIC_DECIMALS) : '?'}/
                            {formatAmount(totalEarned, MYTHIC_DECIMALS)}
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
            <Grid item xs={2}>
                <Box
                    sx={{
                        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.375rem',
                        padding: 2,
                        backgroundColor: '#322659',
                        height: '100%',
                        fontFamily: theme.typography.button,
                        fontSize: '20px',
                        lineHeight: '100%',
                        textAlign: 'center',
                        position: 'relative',
                        width: '100%',
                    }}
                >
                    <Box position="absolute" sx={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                        <WithdrawWidget />
                    </Box>
                </Box>
            </Grid>

            {clanStats.map(({ clanId, clanName, clanMultiplier, total, played, points }, index) => (
                <Grid key={clanName} item xs={1}>
                    <CardMedia
                        image={`/i/clans/${clanName.toLowerCase()}.png`}
                        sx={{
                            boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.375rem',
                            aspectRatio: '3/4',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '65%',
                            backgroundPosition: 'bottom left 50%',
                            backgroundColor: firstPlace[clanId] ? '#B7791F' : lastPlace[clanId] ? '#822727' : '#322659',
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
                                {playerStats ? String(playerStats[index].total) : '?'}/
                                {/* FIXME: https://github.com/facebook/react/pull/24580 */ String(total)}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Questing:
                            </Grid>
                            <Grid item xs={1}>
                                {playerStats ? String(playerStats[index].played) : '?'}/
                                {/* FIXME: https://github.com/facebook/react/pull/24580 */ String(played)}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                Points:
                            </Grid>
                            <Grid item xs={1}>
                                {playerStats ? String(playerStats[index].points) : '?'}/
                                {/* FIXME: https://github.com/facebook/react/pull/24580 */ String(points)}
                            </Grid>

                            <Grid item xs={1} sx={{ pr: 1 }}>
                                MYTHIC:
                            </Grid>
                            <Grid item xs={1} sx={{ whiteSpace: 'nowrap' }}>
                                {playerEarnings ? formatAmount(playerEarnings[index], MYTHIC_DECIMALS) : '?'}/
                                {formatAmount(clanEarnings[index], MYTHIC_DECIMALS)}
                            </Grid>
                        </Grid>
                    </CardMedia>
                </Grid>
            ))}
        </Grid>
    );
};
