import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Faction, NumericInput, Section } from '@labcabrera-rmu/rmu-react-shared-lib';

const FactionForm: FC<{
  formData: Faction;
  setFormData: Dispatch<SetStateAction<Faction>>;
}> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Section title={t('faction')}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label={t('name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!formData.name}
                fullWidth
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>
      <Grid size={12}>
        <Section title={t('settings')}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <NumericInput
                label={t('gold')}
                name="availableGold"
                value={formData.management.availableGold}
                onChange={(e) =>
                  setFormData({ ...formData, management: { ...formData.management, availableGold: e || 0 } })
                }
                maxFractionDigits={2}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>
      <Grid size={12}>
        <Section title={t('lore')}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                label={t('short-description')}
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
                rows={4}
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>
    </Grid>
  );
};

export default FactionForm;
