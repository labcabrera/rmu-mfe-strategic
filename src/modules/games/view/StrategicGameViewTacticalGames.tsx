import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { TacticalGame } from '../../api/tactical-games';
import { gridSizeCard } from '../../services/display';

const StrategicGameViewTacticalGames: FC<{
  tacticalGames: TacticalGame[];
}> = ({ tacticalGames }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={1}>
      {tacticalGames.map((tacticalGame) => (
        <Grid key={tacticalGame.id} size={gridSizeCard}>
          <RmuTextCard
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
        {tacticalGames.length === 0 && (
          <Typography variant="body1" color="secondary">
            <em>{t('No tactical games have been created')}</em>
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewTacticalGames;
