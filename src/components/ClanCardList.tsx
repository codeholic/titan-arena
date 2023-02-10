import { CardMedia, Fade, Grid, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { DataContext } from '../pages';

export const ClanCardList = () => {
    const theme = useTheme();

    const { clanStats, playerStats, currentGame } = useContext(DataContext);

    if (!clanStats || !currentGame) {
        return null;
    }

    const sortedClanStats = [...clanStats];
    sortedClanStats.sort((a, b) => Number(b.points - a.points));

    const firstPlace: Record<number, boolean> = {},
        lastPlace: Record<number, boolean> = {};

    if (sortedClanStats[0].points > sortedClanStats[1].points) {
        firstPlace[sortedClanStats[0].clanId] = true;
    } else if (sortedClanStats[1].points > sortedClanStats[2].points) {
        firstPlace[sortedClanStats[0].clanId] = firstPlace[sortedClanStats[1].clanId] = true;
    }

    const lastIndex = sortedClanStats.length - 1;

    if (sortedClanStats[lastIndex].points < sortedClanStats[lastIndex - 1].points) {
        lastPlace[sortedClanStats[lastIndex].clanId] = true;
    } else if (sortedClanStats[lastIndex - 1].points < sortedClanStats[lastIndex - 2].points) {
        lastPlace[sortedClanStats[lastIndex].clanId] = lastPlace[sortedClanStats[lastIndex - 1].clanId] = true;
    }

    const totalPlayed = clanStats.reduce((result, { played }) => result + Number(played), 0);
    const totalEarned = totalPlayed * 10;

    const clanEarnings = clanStats.map(({ clanId }) =>
        firstPlace[clanId]
            ? (totalEarned * 0.7) / Object.keys(firstPlace).length
            : lastPlace[clanId]
            ? 0
            : (totalEarned * 0.2) / (clanStats.length - Object.keys(firstPlace).length - Object.keys(lastPlace).length)
    );

    const playerPlayed = playerStats && playerStats.reduce((result, { played }) => result + Number(played), 0);
    const playerEarnings =
        playerStats &&
        clanStats.map(
            ({ points }, index) => (Number(playerStats[index].points) / Number(points)) * clanEarnings[index]
        );

    const playerEarned = playerEarnings && playerEarnings.reduce((result, share) => result + share, 0);

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
                            {playerPlayed !== undefined ? playerPlayed * 0.01 : '?'}/{totalPlayed * 0.01}
                        </Grid>

                        <Grid item xs={1} sx={{ pr: 1 }}>
                            MYTHIC To Be Emitted:
                        </Grid>
                        <Grid item xs={1}>
                            {playerEarned !== undefined ? Number(playerEarned.toFixed(2)) : '?'}/
                            {Number(totalEarned.toFixed(2))}
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
                        Reward Claim in Progress
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
                                {playerEarnings ? Number(playerEarnings[index].toFixed(2)) : '?'}/
                                {Number(clanEarnings[index].toFixed(2))}
                            </Grid>
                        </Grid>
                    </CardMedia>
                </Grid>
            ))}
        </Grid>
    );
};
