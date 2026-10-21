import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControlLabel, Grid, MenuItem, Switch, TextField } from '@mui/material';
import {
  NumericInput,
  Realm,
  SelectRealm,
  Section,
  STAT_GENERATIONS,
  StrategicGame,
  TALENT_POLICIES,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_POWER_LEVEL } from '../../services/game-rules';

const gridSize = { xs: 12, md: 3 };

const StrategicGameForm: FC<{
  formData: StrategicGame;
  setFormData: Dispatch<SetStateAction<StrategicGame>>;
  realms?: Realm[];
}> = ({ formData, setFormData, realms }) => {
  const { t } = useTranslation();

  const handleOptionsChange = (field: string, value: number | string | boolean) => {
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
            <Grid size={gridSize}>
              <TextField
                select
                label={t('talent-policy')}
                name="talentPolicy"
                value={formData.options.talentPolicy ?? 'free'}
                onChange={(e) => handleOptionsChange('talentPolicy', e.target.value)}
                fullWidth
              >
                {TALENT_POLICIES.map((policy) => (
                  <MenuItem key={policy} value={policy}>
                    {t(`talent-policy-${policy}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={gridSize}>
              <TextField
                select
                label={t('stat-generation')}
                name="statGeneration"
                value={formData.options.statGeneration ?? 'roll'}
                onChange={(e) => handleOptionsChange('statGeneration', e.target.value)}
                fullWidth
              >
                {STAT_GENERATIONS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {t(`stat-generation-${method}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={gridSize}>
              <FormControlLabel
                control={
                  <Switch
                    name="allowThirdRank"
                    checked={!!formData.options.allowThirdRank}
                    onChange={(e) => handleOptionsChange('allowThirdRank', e.target.checked)}
                  />
                }
                label={t('allow-third-rank')}
              />
            </Grid>
            <Grid size={gridSize}>
              <FormControlLabel
                control={
                  <Switch
                    name="bonusDevPointsCapAtCreation"
                    checked={!!formData.options.bonusDevPointsCapAtCreation}
                    onChange={(e) => handleOptionsChange('bonusDevPointsCapAtCreation', e.target.checked)}
                  />
                }
                label={t('bonus-dev-points-cap-at-creation')}
              />
            </Grid>
            <Grid size={gridSize}>
              <FormControlLabel
                control={
                  <Switch
                    name="openRounds"
                    checked={formData.options.openRounds ?? true}
                    onChange={(e) => handleOptionsChange('openRounds', e.target.checked)}
                  />
                }
                label={t('open-rounds')}
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
            <Grid size={gridSize}>
              <NumericInput
                label={t('max-trait-cost')}
                name="maxTraitCost"
                value={formData.powerLevel.maxTraitCost ?? DEFAULT_POWER_LEVEL.maxTraitCost}
                onChange={(e) => handlePowerLevelChange('maxTraitCost', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('race-dev-points-per-level')}
                name="raceDevPointsPerLevel"
                value={formData.powerLevel.raceDevPointsPerLevel ?? DEFAULT_POWER_LEVEL.raceDevPointsPerLevel}
                onChange={(e) => handlePowerLevelChange('raceDevPointsPerLevel', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('creation-bonus-dev-points')}
                name="creationBonusDevPoints"
                value={formData.powerLevel.creationBonusDevPoints ?? DEFAULT_POWER_LEVEL.creationBonusDevPoints}
                onChange={(e) => handlePowerLevelChange('creationBonusDevPoints', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('stat-points')}
                name="statPoints"
                value={formData.powerLevel.statPoints ?? DEFAULT_POWER_LEVEL.statPoints}
                onChange={(e) => handlePowerLevelChange('statPoints', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('knack-count')}
                name="knackCount"
                value={formData.powerLevel.knackCount ?? DEFAULT_POWER_LEVEL.knackCount}
                onChange={(e) => handlePowerLevelChange('knackCount', e || 0)}
                integer
                allowNegatives={false}
              />
            </Grid>
            <Grid size={gridSize}>
              <NumericInput
                label={t('knack-bonus')}
                name="knackBonus"
                value={formData.powerLevel.knackBonus ?? DEFAULT_POWER_LEVEL.knackBonus}
                onChange={(e) => handlePowerLevelChange('knackBonus', e || 0)}
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
