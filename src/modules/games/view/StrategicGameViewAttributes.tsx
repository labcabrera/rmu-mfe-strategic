import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { RmuTextCard, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../../services/config';
import { gridSizeCard } from '../../services/display';

const grayscale = 0.7;
const gridSize = { xs: 10, md: 3 } as const;

const StrategicGameViewAttributes: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  const { t } = useTranslation();

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
};

export default StrategicGameViewAttributes;
