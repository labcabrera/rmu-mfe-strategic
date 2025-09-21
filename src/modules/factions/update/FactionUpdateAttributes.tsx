import React from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { UpdateFactionDto } from '../../api/faction.dto';
import NumericInput from '../../shared/inputs/NumericInput';

const FactionUpdateAttributes: React.FC<{
  formData: UpdateFactionDto;
  setFormData: React.Dispatch<React.SetStateAction<UpdateFactionDto>>;
}> = ({ formData, setFormData }) => {
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
        <Typography variant="h6" color="primary">
          {t('faction-information')}
        </Typography>
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.management.availableXP}
          integer
          min={0}
          onChange={(e) => handleManagementChange('availableXP', e)}
        />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-gold')}
          name="availableGold"
          value={formData.management.availableGold}
          integer
          min={0}
          onChange={(e) => handleManagementChange('availableGold', e)}
        />
      </Grid>
    </Grid>
  );
};

export default FactionUpdateAttributes;
