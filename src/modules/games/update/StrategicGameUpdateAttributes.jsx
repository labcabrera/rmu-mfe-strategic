/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const FormField = ({ i18nLabel, name, value, onChange, size = 2 }) => {
  const { t } = useTranslation();

  return (
    <Grid size={size}>
      <TextField label={t(i18nLabel)} name={name} value={value} onChange={onChange} fullWidth variant="standard" />
    </Grid>
  );
};

const SeparatorInfo = ({ i18nLabel }) => {
  const { t } = useTranslation();

  return (
    <Grid size={12}>
      <Typography variant="h6" color="primary">
        {t(i18nLabel)}
      </Typography>
    </Grid>
  );
};

const StrategicGameUpdateAttributes = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    const number = isNaN(value) ? value : Number(value);
    setFormData({ ...formData, options: { ...formData.options, [name]: number } });
  };

  const handlePowerLevelChange = (e) => {
    const { name, value } = e.target;
    const number = isNaN(value.replace(',', '.')) ? value : Number(value);
    setFormData({ ...formData, powerLevel: { ...formData.powerLevel, [name]: number } });
  };

  return (
    <Grid container spacing={2}>
      <SeparatorInfo i18nLabel="information" />
      <FormField i18nLabel="name" name="name" value={formData.name} onChange={handleChange} />
      <SeparatorInfo i18nLabel="options" />
      <FormField
        i18nLabel="experience-multiplier"
        name="experienceMultiplier"
        value={formData.options.experienceMultiplier}
        onChange={handleOptionsChange}
        size={1}
      />
      <FormField
        i18nLabel="fatigue-multiplier"
        name="fatigueMultiplier"
        value={formData.options.fatigueMultiplier}
        onChange={handleOptionsChange}
        size={1}
      />
      <FormField
        i18nLabel="board-scale-multiplier"
        name="boardScaleMultiplier"
        value={formData.options.boardScaleMultiplier}
        onChange={handleOptionsChange}
        size={1}
      />
      <FormField i18nLabel="letality" name="letality" value={formData.options.letality} onChange={handleOptionsChange} size={1} />
      <SeparatorInfo i18nLabel="power-level" />
      <FormField
        i18nLabel="stat-random-min"
        name="statRandomMin"
        value={formData.powerLevel.statRandomMin}
        onChange={handlePowerLevelChange}
        size={1}
      />
      <FormField
        i18nLabel="stat-boost-potential"
        name="statBoostPotential"
        value={formData.powerLevel.statBoostPotential}
        onChange={handlePowerLevelChange}
        size={1}
      />
      <FormField
        i18nLabel="stat-boost-temporary"
        name="statBoostTemporary"
        value={formData.powerLevel.statBoostTemporary}
        onChange={handlePowerLevelChange}
        size={1}
      />
      <FormField
        i18nLabel="stat-creation-boosts"
        name="statCreationBoost"
        value={formData.powerLevel.statCreationBoost}
        onChange={handlePowerLevelChange}
        size={1}
      />
      <FormField
        i18nLabel="stat-creation-swaps"
        name="statCreationSwap"
        value={formData.powerLevel.statCreationSwap}
        onChange={handlePowerLevelChange}
        size={1}
      />
      <FormField i18nLabel="description" name="description" value={formData.description} onChange={handleChange} size={12} />
    </Grid>
  );
};

export default StrategicGameUpdateAttributes;
