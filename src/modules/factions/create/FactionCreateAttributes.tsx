import React, { Dispatch, FC, SetStateAction } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { t } from 'i18next';
import { CreateFactionDto } from '../../api/faction.dto';
import NumericInput from '../../shared/inputs/NumericInput';

const FactionCreateAttributes: FC<{
  formData: CreateFactionDto;
  setFormData: Dispatch<SetStateAction<CreateFactionDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={2} sx={{ ml: 5 }}>
      <Grid size={12}>
        <Typography component="h6" color="primary">
          {t('options')}
        </Typography>
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={3}>
        <NumericInput
          label={t('available-gold')}
          name="availableGold"
          value={formData.management.availableGold}
          onChange={(e) => setFormData({ ...formData, management: { ...formData.management, availableGold: e } })}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={3}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.management.availableXP}
          onChange={(e) => setFormData({ ...formData, management: { ...formData.management, availableXP: e } })}
          integer
        />
      </Grid>
    </Grid>
  );
};

export default FactionCreateAttributes;
