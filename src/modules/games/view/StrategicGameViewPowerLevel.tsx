import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import RmuTextCard from '../../shared/cards/RmuTextCard';

const grayscale = 0.7;
const gridSize = { xs: 12, md: 3 } as const;

const StrategicGameViewPowerLevel: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  const DATA = [
    {
      value: strategicGame.powerLevel.baseDevPoints,
      subtitle: t('Dev points'),
      image: `${imageBaseUrl}images/generic/trait-combat.png`,
    },
    {
      value: strategicGame.powerLevel.statRandomMin,
      subtitle: t('Stat rng min'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statBoostPotential,
      subtitle: t('Stat boost potential'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statBoostTemporary,
      subtitle: t('Stat boost temporary'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statCreationBoost,
      subtitle: t('Stat creation boosts'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
    {
      value: strategicGame.powerLevel.statCreationSwap,
      subtitle: t('Stat creation swaps'),
      image: `${imageBaseUrl}images/generic/stat-st.png`,
    },
  ];

  return (
    <Grid container spacing={1} columns={12}>
      {DATA.map((e, index) => (
        <Grid key={index} size={gridSize}>
          <RmuTextCard value={e.value} subtitle={e.subtitle} image={e.image} grayscale={grayscale} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StrategicGameViewPowerLevel;
