import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';

const StrategicGameViewAttributes: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  if (!strategicGame) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {strategicGame.name}
          </Typography>
        </Grid>
        <InfoField i18n="name" value={strategicGame.name} />
        <InfoField i18n="realm" value={strategicGame.realmName || ''} />
        <InfoField i18n="status" value={t(`status-${strategicGame.status}`)} />
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('options')}
          </Typography>
        </Grid>
        <InfoField i18n="experience-multiplier" value={strategicGame.options.experienceMultiplier} size={2} />
        <InfoField i18n="fatigue-multiplier" value={strategicGame.options.fatigueMultiplier} size={2} />
        <InfoField i18n="board-scale-multiplier" value={strategicGame.options.boardScaleMultiplier} size={2} />
        <InfoField i18n="letality" value={strategicGame.options.letality} size={2} />
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('power-level')}
          </Typography>
        </Grid>
        <InfoField i18n="base-dev-points" value={strategicGame.powerLevel.baseDevPoints} size={2} />
        <InfoField i18n="stat-random-min" value={strategicGame.powerLevel.statRandomMin} size={2} />
        <InfoField i18n="stat-boost-potential" value={strategicGame.powerLevel.statBoostPotential} size={2} />
        <InfoField i18n="stat-boost-temporary" value={strategicGame.powerLevel.statBoostTemporary} size={2} />
        <InfoField i18n="stat-creation-boosts" value={strategicGame.powerLevel.statCreationBoost} size={2} />
        <InfoField i18n="stat-creation-swaps" value={strategicGame.powerLevel.statCreationSwap} size={2} />
        {strategicGame.description && <InfoField i18n="description" value={strategicGame.description} size={12} />}
      </Grid>
    </>
  );
};

const InfoField: FC<{
  i18n: string;
  value: string | number | undefined;
  size?: number;
}> = ({ i18n, value, size = 4 }) => {
  const { t } = useTranslation();

  return (
    <Grid size={size}>
      <TextField label={t(i18n)} variant="standard" value={value} fullWidth />
    </Grid>
  );
};

export default StrategicGameViewAttributes;
