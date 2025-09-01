/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const InfoSection = ({ label, value, size = 2 }) => (
  <>
    <Grid item size={size}>
      <TextField label={label} variant="standard" value={value} fullWidth />
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

        <InfoSection label={t('name')} value={strategicGame.name} />
        <InfoSection label={t('realm')} value={realm?.name || ''} />
        <InfoSection label={t('status')} value={t(`status-${strategicGame.status}`)} />

        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('options')}
          </Typography>
        </Grid>

        <InfoSection label={t('experience-multiplier')} value={strategicGame.options.experienceMultiplier} size={1} />
        <InfoSection label={t('fatigue-multiplier')} value={strategicGame.options.fatigueMultiplier} size={1} />
        <InfoSection label={t('board-scale-multiplier')} value={strategicGame.options.boardScaleMultiplier} size={1} />
        <InfoSection label={t('letality')} value={strategicGame.options.letality} size={1} />

        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('power-level')}
          </Typography>
        </Grid>

        <InfoSection label={t('stat-random-min')} value={strategicGame.powerLevel.statRandomMin} size={1} />
        <InfoSection label={t('stat-boost-potential')} value={strategicGame.powerLevel.statBoostPotential} size={1} />
        <InfoSection label={t('stat-boost-temporary')} value={strategicGame.powerLevel.statBoostTemporary} size={1} />
        <InfoSection label={t('stat-creation-boosts')} value={strategicGame.powerLevel.statCreationBoost} size={1} />
        <InfoSection label={t('stat-creation-swaps')} value={strategicGame.powerLevel.statCreationSwap} size={1} />

        {strategicGame && strategicGame.description && <InfoSection label={t('description')} value={strategicGame.description} size={12} />}
      </Grid>
    </>
  );
};

export default StrategicGameViewAttributes;
