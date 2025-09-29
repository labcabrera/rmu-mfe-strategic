import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { TacticalGame } from '../../api/tactical-games';
import AddButton from '../../shared/buttons/AddButton';
import TacticalGameCard from '../../shared/cards/TacticalGameCard';

const StrategicGameViewTacticalGames: FC<{
  strategicGame: StrategicGame;
  tacticalGames: TacticalGame[];
}> = ({ strategicGame, tacticalGames }) => {
  const navigate = useNavigate();

  const onNewTacticalGame = () => {
    navigate(`/tactical/games/create?strategicGame=${strategicGame.id}`);
  };

  return (
    <Grid container spacing={2} sx={{ mt: 5 }}>
      <Grid size={12}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" color="primary" display="inline">
            {t('tactical-games')}
          </Typography>
          <AddButton onClick={onNewTacticalGame} />
        </Box>
      </Grid>
      <Grid size={12}>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          {tacticalGames.map((tacticalGame) => (
            <TacticalGameCard key={tacticalGame.id} tacticalGame={tacticalGame} />
          ))}
        </Box>
        {tacticalGames.length === 0 && <Typography variant="body1">{t('not-found-tactical-games')}</Typography>}
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewTacticalGames;
