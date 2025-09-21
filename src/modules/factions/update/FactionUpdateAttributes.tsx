import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { UpdateFactionDto } from '../../api/faction.dto';
import NumericInput from '../../shared/inputs/NumericInput';

const FactionUpdateAttributes: React.FC<{
  formData: UpdateFactionDto;
  setFormData: React.Dispatch<React.SetStateAction<UpdateFactionDto>>;
}> = ({ formData, setFormData }) => {
  if (!formData) return <p>Loading...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleManagementChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      management: {
        ...formData.management,
        [field]: value,
      },
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('faction-information')}
        </Typography>
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.management.availableXP}
          integer
          min={0}
          onChange={(e) => handleManagementChange('availableXP', e)}
        />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-gold')}
          name="availableGold"
          value={formData.management.availableGold}
          integer
          min={0}
          onChange={(e) => handleManagementChange('availableGold', e)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('short-description')}
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          name="description"
          value={formData.description}
          onChange={handleChange}
          variant="standard"
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default FactionUpdateAttributes;
