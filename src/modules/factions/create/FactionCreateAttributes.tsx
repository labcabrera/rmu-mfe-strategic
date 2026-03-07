import React, { Dispatch, FC, SetStateAction } from 'react';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { t } from 'i18next';
import { CreateFactionDto } from '../../api/faction.dto';
import NumericInput from '../../shared/inputs/NumericInput';

const FactionCreateAttributes: FC<{
  formData: CreateFactionDto;
  setFormData: Dispatch<SetStateAction<CreateFactionDto>>;
}> = ({ formData, setFormData }) => {
  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <TextField
          label={t('faction-name')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!formData.name}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-gold')}
          name="availableGold"
          value={formData.management.availableGold}
          onChange={(e) => setFormData({ ...formData, management: { ...formData.management, availableGold: e } })}
          maxFractionDigits={2}
        />
      </Grid>
      <Grid size={12}>
        <NumericInput
          label={t('available-xp')}
          name="availableXP"
          value={formData.management.availableXP}
          onChange={(e) => setFormData({ ...formData, management: { ...formData.management, availableXP: e } })}
          integer
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('Short description')}
          name="sort-description"
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
          maxRows={12}
        />
      </Grid>
    </Grid>
  );
};

export default FactionCreateAttributes;
