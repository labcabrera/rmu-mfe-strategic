import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import {
  CategorySeparator,
  CreateCharacterDto,
  NumericInput,
  RmuSelect,
  STATS,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const CharacterCreateLore: FC<{
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  return (
    <>
      <CategorySeparator text={t('lore')} />
      <Grid container spacing={1}>
        <Grid size={4}>
          <RmuSelect
            value={formData.roleplay.gender}
            label={t('gender')}
            options={['male', 'female', 'other']}
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, roleplay: { ...prev.roleplay, gender: value } }))
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
    </>
  );
};

export default CharacterCreateLore;
