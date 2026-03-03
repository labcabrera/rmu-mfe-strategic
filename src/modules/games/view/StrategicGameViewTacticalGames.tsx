import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { TacticalGame } from '../../api/tactical-games';
import AddButton from '../../shared/buttons/AddButton';
import RmuTextCard from '../../shared/cards/RmuTextCard';
import TacticalGameCard from '../../shared/cards/TacticalGameCard';

const StrategicGameViewTacticalGames: FC<{
  strategicGame: StrategicGame;
  tacticalGames: TacticalGame[];
}> = ({ strategicGame, tacticalGames }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={1}>
      {tacticalGames.map((tacticalGame) => (
        <Grid key={tacticalGame.id} size={{ xs: 12, md: 3 }}>
          <RmuTextCard
            size="medium"
            value={tacticalGame.name}
            subtitle={tacticalGame.shortDescription}
            image={tacticalGame.imageUrl}
            onClick={() =>
              navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } })
            }
          />
        </Grid>
      ))}
      <Grid size={12}>
        {tacticalGames.length === 0 && <Typography variant="body1">{t('not-found-tactical-games')}</Typography>}
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewTacticalGames;
