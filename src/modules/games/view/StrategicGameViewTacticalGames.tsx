import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import {
  Faction,
  gridSizeCard,
  imageBaseUrl,
  LoadingState,
  RmuTextCard,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const StrategicGameViewTacticalGames: FC<{
  tacticalGames?: TacticalGame[];
  factions?: Faction[];
}> = ({ tacticalGames, factions }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getFactionNames = (tacticalGame: TacticalGame) => {
    if (!tacticalGame.factions || tacticalGame.factions.length === 0) {
      return t('no-factions-added');
    }
    return tacticalGame.factions.map((e) => factions?.find((f) => f.id === e)?.name).join(', ');
  };

  return (
    <>
      {!tacticalGames ? (
        <LoadingState />
      ) : (
        <>
          <Grid container spacing={1}>
            {tacticalGames.map((tacticalGame) => (
              <Grid key={tacticalGame.id} size={gridSizeCard}>
                <RmuTextCard
                  value={tacticalGame.name}
                  subtitle={getFactionNames(tacticalGame)}
                  image={tacticalGame.imageUrl || `${imageBaseUrl}images/generic/tactical.png`}
                  onClick={() =>
                    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } })
                  }
                />
              </Grid>
            ))}
          </Grid>
          <Grid size={12}>
            {tacticalGames.length === 0 && (
              <Typography variant="body1" color="secondary">
                <em>{t('no-tactical-games-have-been-created')}</em>
              </Typography>
            )}
          </Grid>
        </>
      )}
    </>
  );
};

export default StrategicGameViewTacticalGames;
