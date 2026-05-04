import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Grid } from '@mui/material';
import { RmuTextCard, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../../services/config';
import { gridSizeCard } from '../../services/display';

const grayscale = 0.7;

export default function StrategicGameViewAttributes({ strategicGame }: { strategicGame?: StrategicGame }) {
  const { t } = useTranslation();

  if (!strategicGame) return <CircularProgress />;

  const DATA = [
    {
      value: strategicGame.options.experienceMultiplier,
      subtitle: t('experience-multiplier'),
      image: `${imageBaseUrl}images/generic/experience.png`,
    },
    {
      value: strategicGame.options.fatigueMultiplier,
      subtitle: t('fatigue-multiplier'),
      image: `${imageBaseUrl}images/generic/stat-co.png`,
    },
    {
      value: strategicGame.options.boardScaleMultiplier,
      subtitle: t('board-scale'),
      image: `${imageBaseUrl}images/generic/realm.png`,
      applyColor: false,
    },
    {
      value: strategicGame.options.letality,
      subtitle: t('letality'),
      image: `${imageBaseUrl}images/generic/physical.png`,
    },
  ];

  return (
    <Grid container spacing={1}>
      {DATA.map((e, index) => (
        <Grid key={index} size={gridSizeCard}>
          <RmuTextCard
            value={e.value}
            subtitle={e.subtitle}
            image={e.image}
            grayscale={grayscale}
            applyColor={e.applyColor ?? false}
          />
        </Grid>
      ))}
    </Grid>
  );
}
