import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { UpdateCharacterDto } from '../../api/character.dto';
import NumericInput from '../../shared/inputs/NumericInput';
import SelectGender from '../../shared/selects/SelectGender';

const CharacterUpdateAttributes: FC<{
  formData: UpdateCharacterDto;
  setFormData: Dispatch<SetStateAction<UpdateCharacterDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography component="h6" gutterBottom color="primary">
          {t('information')}
        </Typography>
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
