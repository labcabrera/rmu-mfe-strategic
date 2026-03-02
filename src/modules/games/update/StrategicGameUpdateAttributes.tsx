import React, { Dispatch, FC, SetStateAction } from 'react';
import { Divider, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { UpdateStrategicGameDto } from '../../api/strategic-game.dto';
import NumericInput from '../../shared/inputs/NumericInput';

const StrategicGameUpdateAttributes: FC<{
  formData: UpdateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<UpdateStrategicGameDto>>;
}> = ({ formData, setFormData }) => {
  const handleOptionsChange = (field: string, value: number) => {
    setFormData({ ...formData, options: { ...formData.options, [field]: value } });
  };

  const handlePowerLevelChange = (field: string, value: number) => {
    setFormData({ ...formData, powerLevel: { ...formData.powerLevel, [field]: value } });
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <TextField
            label={t('name')}
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!formData.name || formData.name.trim() === ''}
            fullWidth
          />
        </Grid>
      </Grid>

      <Divider sx={{ mt: 2, mb: 2 }} />
      <Typography variant="body1" color="primary" mt={3} mb={3}>
        {t('configuration')}
      </Typography>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('experience-multiplier')}
            name="experienceMultiplier"
            value={formData.options.experienceMultiplier}
            onChange={(e) => handleOptionsChange('experienceMultiplier', e)}
            allowNegatives={false}
            min={0}
            max={100}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('fatigue-multiplier')}
            name="fatigueMultiplier"
            value={formData.options.fatigueMultiplier}
            onChange={(e) => handleOptionsChange('fatigueMultiplier', e)}
            allowNegatives={false}
            min={0}
            max={10}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('board-scale-multiplier')}
            name="boardScaleMultiplier"
            value={formData.options.boardScaleMultiplier}
            onChange={(e) => handleOptionsChange('boardScaleMultiplier', e)}
            allowNegatives={false}
            min={0}
            max={100}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('letality')}
            name="letality"
            value={formData.options.letality}
            onChange={(e) => handleOptionsChange('letality', e)}
            integer
            min={-100}
            max={100}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mt: 2, mb: 2 }} />
      <Typography variant="body1" color="primary" mt={3} mb={3}>
        {t('power-level')}
      </Typography>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('stat-random-min')}
            name="statRandomMin"
            value={formData.powerLevel.statRandomMin}
            onChange={(e) => handlePowerLevelChange('statRandomMin', e)}
            integer
            allowNegatives={false}
            min={1}
            max={100}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('stat-boost-potential')}
            name="statBoostPotential"
            value={formData.powerLevel.statBoostPotential}
            onChange={(e) => handlePowerLevelChange('statBoostPotential', e)}
            integer
            allowNegatives={false}
            min={1}
            max={100}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('stat-boost-temporary')}
            name="statBoostTemporary"
            value={formData.powerLevel.statBoostTemporary}
            onChange={(e) => handlePowerLevelChange('statBoostTemporary', e)}
            integer
            allowNegatives={false}
            min={1}
            max={100}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}></Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('stat-creation-boosts')}
            name="statCreationBoost"
            value={formData.powerLevel.statCreationBoost}
            onChange={(e) => handlePowerLevelChange('statCreationBoost', e)}
            integer
            allowNegatives={false}
            min={0}
            max={10}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <NumericInput
            label={t('stat-creation-swaps')}
            name="statCreationSwaps"
            value={formData.powerLevel.statCreationSwap}
            onChange={(e) => handlePowerLevelChange('statCreationSwap', e)}
            integer
            allowNegatives={false}
            min={0}
            max={10}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mt: 2, mb: 2 }} />
      <Typography variant="body1" color="primary" mt={3} mb={3}>
        {t('lore')}
      </Typography>

      <Grid container spacing={1} mt={2}>
        <Grid size={12}>
          <TextField
            label={t('short-description')}
            name="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label={t('description')}
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            maxRows={12}
            multiline
          />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameUpdateAttributes;
