/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const InfoSection = ({ label, value, labelSize = 2, valueSize = 1 }) => (
  <>
    <Grid item size={labelSize}>
      <Typography variant="body1" color="textSecondary">
        {label}:
      </Typography>
    </Grid>
    <Grid item size={valueSize}>
      <Typography variant="body1" color="textPrimary">
        {value}
      </Typography>
    </Grid>
  </>
);

const StrategicGameViewAttributes = ({ strategicGame, realm }) => {
  const { t } = useTranslation();

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('information')}
          </Typography>
        </Grid>

        <InfoSection label={t('name')} value={strategicGame.name} valueSize={10} />
        <InfoSection label={t('realm')} value={realm?.name || ''} valueSize={10} />
        <InfoSection label={t('status')} value={t(`status-${strategicGame.status}`)} valueSize={10} />

        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('options')}
          </Typography>
        </Grid>

        <InfoSection label={t('experience-multiplier')} value={strategicGame.options.experienceMultiplier} valueSize={10} />
        <InfoSection label={t('fatigue-multiplier')} value={strategicGame.options.fatigueMultiplier} valueSize={10} />
        <InfoSection label={t('board-scale-multiplier')} value={strategicGame.options.boardScaleMultiplier} valueSize={10} />
        <InfoSection label={t('letality')} value={strategicGame.options.letality} valueSize={10} />

        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('power-level')}
          </Typography>
        </Grid>

        <InfoSection label={t('stat-random-min')} value={strategicGame.powerLevel.statRandomMin} valueSize={10} />
        <InfoSection label={t('stat-boost-potential')} value={strategicGame.powerLevel.statBoostPotential} valueSize={10} />
        <InfoSection label={t('stat-boost-temporary')} value={strategicGame.powerLevel.statBoostTemporary} valueSize={10} />
        <InfoSection label={t('stat-creation-boosts')} value={strategicGame.powerLevel.statCreationBoost} valueSize={10} />
        <InfoSection label={t('stat-creation-swaps')} value={strategicGame.powerLevel.statCreationSwap} valueSize={10} />

        {strategicGame && strategicGame.description && <InfoSection label={t('description')} value={strategicGame.description} valueSize={10} />}
      </Grid>
    </>
  );
};

export default StrategicGameViewAttributes;
