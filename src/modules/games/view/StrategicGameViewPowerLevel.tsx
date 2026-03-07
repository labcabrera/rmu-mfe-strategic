import React, { FC } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import NumericCard from '../../shared/cards/NumericCard';
import RmuTextCard from '../../shared/cards/RmuTextCard';

const grayscale = 0.7;

const StrategicGameViewPowerLevel: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.powerLevel.baseDevPoints}
          subtitle={t('base-dev-points')}
          image={`${imageBaseUrl}images/generic/trait-combat.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.powerLevel.statRandomMin}
          subtitle={t('stat-random-min')}
          image={`${imageBaseUrl}images/generic/stat-st.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.powerLevel.statBoostPotential}
          subtitle={t('stat-boost-potential')}
          image={`${imageBaseUrl}images/generic/stat-st.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.powerLevel.statBoostTemporary}
          subtitle={t('stat-boost-temporary')}
          image={`${imageBaseUrl}images/generic/stat-st.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.powerLevel.statCreationBoost}
          subtitle={t('stat-creation-boosts')}
          image={`${imageBaseUrl}images/generic/stat-st.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.powerLevel.statCreationSwap}
          subtitle={t('stat-creation-swaps')}
          image={`${imageBaseUrl}images/generic/stat-st.png`}
          grayscale={grayscale}
        />
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewPowerLevel;
