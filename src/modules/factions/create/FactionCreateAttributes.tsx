import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CreateFactionDto } from '../../api/faction.dto';
import NumericInput from '../../shared/inputs/NumericInput';

const FactionCreateAttributes: FC<{
  formData: CreateFactionDto;
  setFormData: Dispatch<SetStateAction<CreateFactionDto>>;
}> = ({ formData, setFormData }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('create-faction')}
        </Typography>
      </Grid>
      <Grid size={3}>
        <TextField
          label={t('name')}
          variant="standard"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={3}>
        <NumericInput
          label={t('available-gold')}
          name="availableGold"
          value={formData.management.availableGold}
          onChange={(e) => setFormData({ ...formData, management: { ...formData.management, availableGold: e } })}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={3}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.management.availableXP}
          onChange={(e) => setFormData({ ...formData, management: { ...formData.management, availableXP: e } })}
          integer
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={6}>
        <TextField
          label={t('description')}
          variant="standard"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default FactionCreateAttributes;
