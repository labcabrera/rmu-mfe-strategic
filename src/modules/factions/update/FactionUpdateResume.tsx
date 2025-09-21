import React from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { UpdateFactionDto } from '../../api/faction.dto';

const FactionUpdateResume: React.FC<{
  formData: UpdateFactionDto;
  setFormData: React.Dispatch<React.SetStateAction<UpdateFactionDto>>;
}> = ({ formData, setFormData }) => {
  if (!formData) return <p>Loading...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Grid container spacing={2}>
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
          multiline
          rows={12}
        />
      </Grid>
    </Grid>
  );
};

export default FactionUpdateResume;
