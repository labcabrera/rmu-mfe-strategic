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
import { resolvePowerLevel } from '../../services/game-rules';

const grayscale = 0.7;

const StrategicGameViewPowerLevel: FC<{
  strategicGame?: StrategicGame;
}> = ({ strategicGame }) => {
  const { t } = useTranslation();

  if (!strategicGame) return <LoadingState />;

  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);

  const DATA = [
    {
      value: powerLevel.baseDevPoints,
      subtitle: t('dev-points'),
      image: `${imageBaseUrl}images/generic/trait-combat.png`,
    },
    {
      value: powerLevel.statRandomMin,
      subtitle: t('stat-random-min'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: powerLevel.statBoostPotential,
      subtitle: t('stat-boost-potential'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: powerLevel.statBoostTemporary,
      subtitle: t('stat-boost-temporary'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: powerLevel.statCreationBoost,
      subtitle: t('stat-creation-boosts'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: powerLevel.statCreationSwap,
      subtitle: t('stat-creation-swaps'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: powerLevel.maxTraitCost,
      subtitle: t('max-trait-cost'),
      image: `${imageBaseUrl}images/generic/trait.png`,
    },
    {
      value: powerLevel.raceDevPointsPerLevel,
      subtitle: t('race-dev-points-per-level'),
      image: `${imageBaseUrl}images/generic/dev-points.png`,
    },
    {
      value: powerLevel.creationBonusDevPoints,
      subtitle: t('creation-bonus-dev-points'),
      image: `${imageBaseUrl}images/generic/dev-points.png`,
    },
    {
      value: powerLevel.statPoints,
      subtitle: t('stat-points'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: powerLevel.knackCount,
      subtitle: t('knack-count'),
      image: `${imageBaseUrl}images/generic/skills.png`,
    },
    {
      value: powerLevel.knackBonus,
      subtitle: t('knack-bonus'),
      image: `${imageBaseUrl}images/generic/skills.png`,
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
