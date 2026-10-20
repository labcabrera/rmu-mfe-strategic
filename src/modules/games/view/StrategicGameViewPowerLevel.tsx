import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import {
  gridSizeCard,
  imageBaseUrl,
  LoadingState,
  RmuTextCard,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const grayscale = 0.7;

const StrategicGameViewPowerLevel: FC<{
  strategicGame?: StrategicGame;
}> = ({ strategicGame }) => {
  const { t } = useTranslation();

  if (!strategicGame) return <LoadingState />;

  const DATA = [
    {
      value: strategicGame.powerLevel.baseDevPoints,
      subtitle: t('dev-points'),
      image: `${imageBaseUrl}images/generic/trait-combat.png`,
    },
    {
      value: strategicGame.powerLevel.statRandomMin,
      subtitle: t('stat-random-min'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statBoostPotential,
      subtitle: t('stat-boost-potential'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statBoostTemporary,
      subtitle: t('stat-boost-temporary'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statCreationBoost,
      subtitle: t('stat-creation-boosts'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statCreationSwap,
      subtitle: t('stat-creation-swaps'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.maxTraitCost ?? 20,
      subtitle: t('max-trait-cost'),
      image: `${imageBaseUrl}images/generic/trait.png`,
    },
  ];

  return (
    <Grid container spacing={1} columns={12}>
      {DATA.map((e, index) => (
        <Grid key={index} size={gridSizeCard}>
          <RmuTextCard value={e.value} subtitle={e.subtitle} image={e.image} grayscale={grayscale} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StrategicGameViewPowerLevel;
