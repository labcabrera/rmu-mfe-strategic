import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import { CreateCharacterDto, EnumPicker, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';

const GENDERS = ['male', 'female', 'other'];

const CharacterCreateLore: FC<{
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1}>
      <Grid size={4}>
        <EnumPicker
          value={formData.roleplay.gender}
          label={t('gender')}
          values={GENDERS}
          onChange={(value) =>
            value && setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, gender: value } }))
          }
        />
      </Grid>
      <Grid size={4}>
        <NumericInput
          label={t('age')}
          name="age"
          value={formData.roleplay.age}
          onChange={(value) => setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, age: value! } }))}
          integer
          allowNegatives={false}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          rows={6}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterCreateLore;
