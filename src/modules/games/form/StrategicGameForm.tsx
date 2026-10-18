import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import { NumericInput, Realm, StrategicGame, SelectRealm, Section } from '@labcabrera-rmu/rmu-react-shared-lib';

const gridSize = { xs: 12, md: 3 };

const StrategicGameForm: FC<{
  formData: StrategicGame;
  setFormData: Dispatch<SetStateAction<StrategicGame>>;
  realms?: Realm[];
}> = ({ formData, setFormData, realms }) => {
  const { t } = useTranslation();

  const handleOptionsChange = (field: string, value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [field]: value,
      },
    }));
  };

  const handlePowerLevelChange = (field: string, value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      powerLevel: {
        ...prevData.powerLevel,
        [field]: value,
      },
    }));
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
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
            {realms && (
              <Grid size={12}>
                <SelectRealm
                  realms={realms}
                  value={formData.realmId}
                  onChange={(realmId) => setFormData({ ...formData, realmId: realmId || '' })}
                  required
                />
              </Grid>
            )}
          </Grid>
        </Section>
      </Grid>
      <Grid size={12}>
        <Section title={t('settings')}>
          <Grid container spacing={2}>
            <Grid size={gridSize}>
              <NumericInput
                label={t('experience-multiplier')}
                name="experienceMultiplier"
                value={formData.options.experienceMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, options: { ...formData.options, experienceMultiplier: e || 1 } })
                }
                maxFractionDigits={2}
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('fatigue-multiplier')}
                name="fatigueMultiplier"
                value={formData.options.fatigueMultiplier}
                onChange={(e) => handleOptionsChange('fatigueMultiplier', e || 0)}
                maxFractionDigits={2}
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('board-scale')}
                name="boardScaleMultiplier"
                value={formData.options.boardScaleMultiplier}
                onChange={(e) => handleOptionsChange('boardScaleMultiplier', e || 1)}
                maxFractionDigits={2}
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('letality')}
                name="letality"
                value={formData.options.letality}
                onChange={(e) => handleOptionsChange('letality', e || 0)}
                integer
              />
            </Grid>
          </Grid>
        </Section>
      </Grid>
      <Grid size={12}>
        <Section title={t('power-level')}>
          <Grid container spacing={2}>
            <Grid size={gridSize}>
              <NumericInput
                label={t('base-dev-points')}
                name="baseDevPoints"
                value={formData.powerLevel.baseDevPoints}
                onChange={(e) => handlePowerLevelChange('baseDevPoints', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('stat-random-min')}
                name="statRandomMin"
                value={formData.powerLevel.statRandomMin}
                onChange={(e) => handlePowerLevelChange('statRandomMin', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('stat-boost-potential')}
                name="statBoostPotential"
                value={formData.powerLevel.statBoostPotential}
                onChange={(e) => handlePowerLevelChange('statBoostPotential', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('stat-boost-temporary')}
                name="statBoostTemporary"
                value={formData.powerLevel.statBoostTemporary}
                onChange={(e) => handlePowerLevelChange('statBoostTemporary', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('stat-creation-boosts')}
                name="statCreationBoost"
                value={formData.powerLevel.statCreationBoost}
                onChange={(e) => handlePowerLevelChange('statCreationBoost', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('stat-creation-swaps')}
                name="statCreationSwap"
                value={formData.powerLevel.statCreationSwap}
                onChange={(e) => handlePowerLevelChange('statCreationSwap', e || 0)}
                integer
                allowNegatives={false}
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
      </Grid>
    </Grid>
  );
};

export default StrategicGameForm;
