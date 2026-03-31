import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import { gridSizeCard } from '../../services/display';

const grayscale = 0.7;
const gridSize = { xs: 10, md: 3 } as const;

const StrategicGameViewAttributes: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  const DATA = [
    {
      value: strategicGame.options.experienceMultiplier,
      subtitle: t('Experience multiplier'),
      image: `${imageBaseUrl}images/generic/experience.png`,
    },
    {
      value: strategicGame.options.fatigueMultiplier,
      subtitle: t('Fatigue multiplier'),
      image: `${imageBaseUrl}images/generic/stat-co.png`,
    },
    {
      value: strategicGame.options.boardScaleMultiplier,
      subtitle: t('Board scale'),
      image: `${imageBaseUrl}images/generic/realm.png`,
      applyColor: false,
    },
    {
      value: strategicGame.options.letality,
      subtitle: t('Letality'),
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
