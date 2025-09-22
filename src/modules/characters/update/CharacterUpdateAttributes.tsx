import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { CreateCharacterDto, UpdateCharacterDto } from '../../api/character.dto';
import NumericInput from '../../shared/inputs/NumericInput';
import SelectGender from '../../shared/selects/SelectGender';

const CharacterUpdateAttributes: FC<{
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
        <Typography variant="h6" gutterBottom>
          {t('character-info')}
        </Typography>
      </Grid>
      <Grid size={4}>
        <NumericInput
          label={t('weight')}
          name="weight"
          value={formData.info?.weight || 0}
          onChange={(e) => setFormData({ ...formData, info: { ...formData.info, weight: e } })}
          allowNegatives={false}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={4}>
        <NumericInput
          label={t('height')}
          name="height"
          value={formData.info?.height || 0}
          onChange={(e) => setFormData({ ...formData, info: { ...formData.info, height: e } })}
          allowNegatives={false}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={4}>
        <NumericInput
          label={t('age')}
          name="age"
          value={formData.roleplay?.age || 0}
          onChange={(e) => setFormData({ ...formData, roleplay: { ...formData.roleplay, age: e } })}
          allowNegatives={false}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={4}>
        <SelectGender
          value={formData.roleplay?.gender}
          onChange={(gender) => setFormData({ ...formData, roleplay: { ...formData.roleplay, gender } })}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterUpdateAttributes;
