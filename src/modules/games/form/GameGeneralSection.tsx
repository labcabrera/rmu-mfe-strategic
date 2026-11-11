import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, MenuItem, TextField } from '@mui/material';
import { Realm, RealmPicker, Section } from '@labcabrera-rmu/rmu-react-shared-lib';
import { GameFormSectionProps } from './game-form-section';

/** Name, visibility and realm of the game. */
const GameGeneralSection: FC<GameFormSectionProps & { realms?: Realm[]; canChangeVisibility: boolean }> = ({
  formData,
  setFormData,
  realms,
  canChangeVisibility,
}) => {
  const { t } = useTranslation();

  return (
    <Section title={t('strategic-game')}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label={t('name')}
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!formData.name}
            autoFocus
            fullWidth
          />
        </Grid>
        <Grid size={12}>
          <TextField
            select
            label={t('game-visibility')}
            name="accessType"
            value={formData.accessType ?? 'private'}
            disabled={!canChangeVisibility}
            onChange={(e) => setFormData({ ...formData, accessType: e.target.value as 'public' | 'private' })}
            helperText={t(`game-visibility-${formData.accessType ?? 'private'}-help`)}
            fullWidth
          >
            <MenuItem value="private">{t('game-visibility-private')}</MenuItem>
            <MenuItem value="public">{t('game-visibility-public')}</MenuItem>
          </TextField>
        </Grid>
        {realms && (
          <Grid size={12}>
            <RealmPicker
              realms={realms}
              variant="select"
              value={formData.realmId}
              onChange={(realmId) => setFormData({ ...formData, realmId: realmId || '' })}
              required
            />
          </Grid>
        )}
      </Grid>
    </Section>
  );
};

export default GameGeneralSection;
