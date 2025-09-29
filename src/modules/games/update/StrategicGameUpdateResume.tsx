import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { UpdateStrategicGameDto } from '../../api/strategic-game.dto';

const StrategicGameUpdateResume: FC<{
  formData: UpdateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<UpdateStrategicGameDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('name')}
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('short-description')}
          name="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          fullWidth
          variant="standard"
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
          variant="standard"
        />
      </Grid>
    </Grid>
  );
};

export default StrategicGameUpdateResume;
