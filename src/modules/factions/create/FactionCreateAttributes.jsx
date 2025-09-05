/* eslint-disable react/prop-types */
import React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import NumericTextField from '../../shared/inputs/NumericTextField';

const FactionCreateAttributes = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={3}>
        <TextField label="Name" variant="standard" name="name" value={formData.name} onChange={handleChange} required fullWidth />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={3}>
        <NumericTextField
          label="Available gold"
          name="availableGold"
          value={formData.availableGold}
          onChange={handleChange}
          maxDecimals={2}
          required
        />
      </Grid>
      <Grid size={3}>
        <NumericTextField label="Available XP" name="availableXP" value={formData.availableXP} onChange={handleChange} required />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={6}>
        <TextField label="Description" variant="standard" name="description" value={formData.description} onChange={handleChange} fullWidth />
      </Grid>
    </Grid>
  );
};

export default FactionCreateAttributes;
