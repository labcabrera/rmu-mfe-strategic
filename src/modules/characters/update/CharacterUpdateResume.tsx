import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { UpdateCharacterDto } from '../../api/character.dto';

const CharacterUpdateResume: FC<{
  formData: UpdateCharacterDto;
  setFormData: Dispatch<SetStateAction<UpdateCharacterDto>>;
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
          variant="standard"
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          fullWidth
          name="description"
          value={formData.description}
          onChange={handleChange}
          variant="standard"
          multiline
          minRows={4}
          rows={12}
          maxRows={24}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterUpdateResume;
