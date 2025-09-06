/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NumericFormField from '../../shared/inputs/NumericTextField';

const FormField = ({ i18nLabel, name, value, onChange, size }) => {
  const { t } = useTranslation();

  return (
    <Grid size={size}>
      <TextField label={t(i18nLabel)} name={name} value={value} onChange={onChange} fullWidth variant="standard" />
    </Grid>
  );
};

const HeaderCategory = ({ i18nLabel }) => {
  const { t } = useTranslation();

  return (
    <Grid size={12}>
      <Typography variant="h6" color="primary">
        {t(i18nLabel)}
      </Typography>
    </Grid>
  );
};

const FactionUpdateAttributes = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Grid container spacing={2}>
      <HeaderCategory i18nLabel="information" />
      <FormField i18nLabel="name" name="name" value={formData.name} onChange={handleChange} size={6} />
      <Grid size={12}></Grid>
      <Grid size={6}>
        <NumericFormField label="available-xp" name="availableXP" value={formData.availableXP} onChange={handleChange} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={6}>
        <NumericFormField label="available-gold" name="availableGold" value={formData.availableGold} onChange={handleChange} maxDecimals={2} />
      </Grid>
      <Grid size={12}></Grid>
      <FormField i18nLabel="description" name="description" value={formData.description} onChange={handleChange} size={6} />
    </Grid>
  );
};

export default FactionUpdateAttributes;
