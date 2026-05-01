import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import { Faction, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';

const FactionUpdateAttributes: FC<{
  formData: Faction;
  setFormData: Dispatch<SetStateAction<Faction>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  if (!formData) return <p>Loading...</p>;

  const handleManagementChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      management: {
        ...formData.management,
        [field]: value,
      },
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('name')}
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
        />
      </Grid>

      <Grid size={12}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.management.availableXP}
          integer
          min={0}
          onChange={(e) => handleManagementChange('availableXP', e || 0)}
        />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-gold')}
          name="availableGold"
          value={formData.management.availableGold}
          integer
          min={0}
          onChange={(e) => handleManagementChange('availableGold', e || 0)}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('short-description')}
          name="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('Short description')}
          name="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={12}
        />
      </Grid>
    </Grid>
  );
};

export default FactionUpdateAttributes;
