import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CreateFactionDto } from '../../api/faction.dto';
import NumericInput from '../../shared/inputs/NumericInput';
import NumericTextField from '../../shared/inputs/NumericTextField';

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
          value={formData.availableGold}
          onChange={(e) => setFormData({ ...formData, availableGold: e })}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={3}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.availableXP}
          onChange={(e) => setFormData({ ...formData, availableXP: e })}
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
