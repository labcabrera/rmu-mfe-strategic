import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import { EnumPicker, NumericInput, UpdateCharacterDto } from '@labcabrera-rmu/rmu-react-shared-lib';

const GENDERS = ['male', 'female', 'other'];

export default function CharacterEditAttributes({
  formData,
  setFormData,
}: {
  formData: UpdateCharacterDto;
  setFormData: Dispatch<SetStateAction<UpdateCharacterDto | undefined>>;
}) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('name')}
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!formData.name || formData.name.trim() === ''}
          fullWidth
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <NumericInput
          label={t('height')}
          name="height"
          value={formData.info?.height || 0}
          onChange={(e) => setFormData({ ...formData, info: { ...formData.info!, height: e || 0 } })}
          allowNegatives={false}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <NumericInput
          label={t('weight')}
          name="weight"
          value={formData.info?.weight || 0}
          onChange={(e) => setFormData({ ...formData, info: { ...formData.info!, weight: e || 0 } })}
          allowNegatives={false}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <NumericInput
          label={t('age')}
          name="age"
          value={formData.roleplay?.age || 0}
          onChange={(e) => setFormData({ ...formData, roleplay: { ...formData.roleplay!, age: e || 20 } })}
          allowNegatives={false}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <EnumPicker
          value={formData.roleplay?.gender || null}
          label={t('gender')}
          values={GENDERS}
          variant="select"
          onChange={(gender) => gender && setFormData({ ...formData, roleplay: { ...formData.roleplay!, gender } })}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          fullWidth
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          multiline
          rows={6}
        />
      </Grid>
    </Grid>
  );
}
