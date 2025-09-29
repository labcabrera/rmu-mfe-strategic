import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { UpdateCharacterDto } from '../../api/character.dto';

const CharacterUpdateResume: FC<{
  formData: UpdateCharacterDto;
  setFormData: Dispatch<SetStateAction<UpdateCharacterDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('name')}
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          variant="standard"
          error={!formData.name || formData.name.trim() === ''}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          fullWidth
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          variant="standard"
          multiline
          rows={18}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterUpdateResume;
