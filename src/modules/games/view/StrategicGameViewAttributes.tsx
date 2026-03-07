import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import RmuTextCard from '../../shared/cards/RmuTextCard';

const grayscale = 0.7;

const StrategicGameViewAttributes: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.options.experienceMultiplier}
          subtitle={t('experience-multiplier')}
          image={`${imageBaseUrl}images/generic/experience.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.options.fatigueMultiplier}
          subtitle={t('fatigue-multiplier')}
          image={`${imageBaseUrl}images/generic/stat-co.png`}
          grayscale={grayscale}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.options.boardScaleMultiplier}
          subtitle={t('board-scale-multiplier')}
          image={`${imageBaseUrl}images/generic/realm.png`}
          grayscale={grayscale}
          applyColor={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <RmuTextCard
          value={strategicGame.options.letality}
          subtitle={t('letality')}
          image={`${imageBaseUrl}images/generic/physical.png`}
          grayscale={grayscale}
        />
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewAttributes;
