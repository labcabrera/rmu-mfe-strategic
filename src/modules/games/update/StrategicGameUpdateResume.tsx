import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { UpdateStrategicGameDto } from '../../api/strategic-game.dto';

const StrategicGameUpdateResume: FC<{
  formData: UpdateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<UpdateStrategicGameDto>>;
}> = ({ formData, setFormData }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('short-description')}
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          maxRows={12}
          multiline
          variant="standard"
        />
      </Grid>
    </Grid>
  );
};

export default StrategicGameUpdateResume;
