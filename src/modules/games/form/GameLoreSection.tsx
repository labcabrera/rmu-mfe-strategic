import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import { Section } from '@labcabrera-rmu/rmu-react-shared-lib';
import { GameFormSectionProps } from './game-form-section';

/** Descriptions of the game. */
const GameLoreSection: FC<GameFormSectionProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  return (
    <Section title={t('lore')}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label={t('short-description')}
            name="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            fullWidth
            multiline
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
  );
};

export default GameLoreSection;
