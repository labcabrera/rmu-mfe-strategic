import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';
import {
  EnumPicker,
  NumericInput,
  Realm,
  RealmPicker,
  Section,
  STAT_GENERATIONS,
  StrategicGame,
  TALENT_POLICIES,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_OPTIONS, DEFAULT_POWER_LEVEL } from '../../services/game-rules';
import { GameOptionField } from '../GameOptionHint';

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
                <RealmPicker
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
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary">
                {t('game-settings-intro')}
              </Typography>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="experience-multiplier"
                label={t('experience-multiplier')}
                defaultValue={DEFAULT_OPTIONS.experienceMultiplier}
              >
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
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="fatigue-multiplier"
                label={t('fatigue-multiplier')}
                defaultValue={DEFAULT_OPTIONS.fatigueMultiplier}
              >
                <NumericInput
                  label={t('fatigue-multiplier')}
                  name="fatigueMultiplier"
                  value={formData.options.fatigueMultiplier}
                  onChange={(e) => handleOptionsChange('fatigueMultiplier', e || 0)}
                  maxFractionDigits={2}
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="board-scale"
                label={t('board-scale')}
                defaultValue={DEFAULT_OPTIONS.boardScaleMultiplier}
              >
                <NumericInput
                  label={t('board-scale')}
                  name="boardScaleMultiplier"
                  value={formData.options.boardScaleMultiplier}
                  onChange={(e) => handleOptionsChange('boardScaleMultiplier', e || 1)}
                  maxFractionDigits={2}
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField option="letality" label={t('letality')} defaultValue={DEFAULT_OPTIONS.letality}>
                <NumericInput
                  label={t('letality')}
                  name="letality"
                  value={formData.options.letality}
                  onChange={(e) => handleOptionsChange('letality', e || 0)}
                  integer
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="talent-policy"
                label={t('talent-policy')}
                defaultValue={DEFAULT_OPTIONS.talentPolicy}
              >
                <EnumPicker
                  label={t('talent-policy')}
                  name="talentPolicy"
                  variant="select"
                  values={TALENT_POLICIES}
                  labelPrefix="talent-policy-"
                  descriptionPrefix="talent-policy-help-"
                  value={formData.options.talentPolicy ?? 'free'}
                  onChange={(policy) => policy && handleOptionsChange('talentPolicy', policy)}
                  required
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-generation"
                label={t('stat-generation')}
                defaultValue={DEFAULT_OPTIONS.statGeneration}
              >
                <EnumPicker
                  label={t('stat-generation')}
                  name="statGeneration"
                  variant="select"
                  values={STAT_GENERATIONS}
                  labelPrefix="stat-generation-"
                  descriptionPrefix="stat-generation-help-"
                  value={formData.options.statGeneration ?? 'roll'}
                  onChange={(method) => method && handleOptionsChange('statGeneration', method)}
                  required
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="allow-third-rank"
                label={t('allow-third-rank')}
                defaultValue={DEFAULT_OPTIONS.allowThirdRank}
              >
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
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="bonus-dev-points-cap-at-creation"
                label={t('bonus-dev-points-cap-at-creation')}
                defaultValue={DEFAULT_OPTIONS.bonusDevPointsCapAtCreation}
              >
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
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField option="open-rounds" label={t('open-rounds')} defaultValue={DEFAULT_OPTIONS.openRounds}>
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
              </GameOptionField>
            </Grid>
          </Grid>
        </Section>
      </Grid>
      <Grid size={12}>
        <Section title={t('power-level')}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary">
                {t('game-power-level-intro')}
              </Typography>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="base-dev-points"
                label={t('base-dev-points')}
                defaultValue={DEFAULT_POWER_LEVEL.baseDevPoints}
              >
                <NumericInput
                  label={t('base-dev-points')}
                  name="baseDevPoints"
                  value={formData.powerLevel.baseDevPoints}
                  onChange={(e) => handlePowerLevelChange('baseDevPoints', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-random-min"
                label={t('stat-random-min')}
                defaultValue={DEFAULT_POWER_LEVEL.statRandomMin}
              >
                <NumericInput
                  label={t('stat-random-min')}
                  name="statRandomMin"
                  value={formData.powerLevel.statRandomMin}
                  onChange={(e) => handlePowerLevelChange('statRandomMin', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-boost-potential"
                label={t('stat-boost-potential')}
                defaultValue={DEFAULT_POWER_LEVEL.statBoostPotential}
              >
                <NumericInput
                  label={t('stat-boost-potential')}
                  name="statBoostPotential"
                  value={formData.powerLevel.statBoostPotential}
                  onChange={(e) => handlePowerLevelChange('statBoostPotential', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-boost-temporary"
                label={t('stat-boost-temporary')}
                defaultValue={DEFAULT_POWER_LEVEL.statBoostTemporary}
              >
                <NumericInput
                  label={t('stat-boost-temporary')}
                  name="statBoostTemporary"
                  value={formData.powerLevel.statBoostTemporary}
                  onChange={(e) => handlePowerLevelChange('statBoostTemporary', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-creation-boosts"
                label={t('stat-creation-boosts')}
                defaultValue={DEFAULT_POWER_LEVEL.statCreationBoost}
              >
                <NumericInput
                  label={t('stat-creation-boosts')}
                  name="statCreationBoost"
                  value={formData.powerLevel.statCreationBoost}
                  onChange={(e) => handlePowerLevelChange('statCreationBoost', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-creation-swaps"
                label={t('stat-creation-swaps')}
                defaultValue={DEFAULT_POWER_LEVEL.statCreationSwap}
              >
                <NumericInput
                  label={t('stat-creation-swaps')}
                  name="statCreationSwap"
                  value={formData.powerLevel.statCreationSwap}
                  onChange={(e) => handlePowerLevelChange('statCreationSwap', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="max-trait-cost"
                label={t('max-trait-cost')}
                defaultValue={DEFAULT_POWER_LEVEL.maxTraitCost}
              >
                <NumericInput
                  label={t('max-trait-cost')}
                  name="maxTraitCost"
                  value={formData.powerLevel.maxTraitCost ?? DEFAULT_POWER_LEVEL.maxTraitCost}
                  onChange={(e) => handlePowerLevelChange('maxTraitCost', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="race-dev-points-per-level"
                label={t('race-dev-points-per-level')}
                defaultValue={DEFAULT_POWER_LEVEL.raceDevPointsPerLevel}
              >
                <NumericInput
                  label={t('race-dev-points-per-level')}
                  name="raceDevPointsPerLevel"
                  value={formData.powerLevel.raceDevPointsPerLevel ?? DEFAULT_POWER_LEVEL.raceDevPointsPerLevel}
                  onChange={(e) => handlePowerLevelChange('raceDevPointsPerLevel', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="creation-bonus-dev-points"
                label={t('creation-bonus-dev-points')}
                defaultValue={DEFAULT_POWER_LEVEL.creationBonusDevPoints}
              >
                <NumericInput
                  label={t('creation-bonus-dev-points')}
                  name="creationBonusDevPoints"
                  value={formData.powerLevel.creationBonusDevPoints ?? DEFAULT_POWER_LEVEL.creationBonusDevPoints}
                  onChange={(e) => handlePowerLevelChange('creationBonusDevPoints', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="stat-points"
                label={t('stat-points')}
                defaultValue={DEFAULT_POWER_LEVEL.statPoints}
              >
                <NumericInput
                  label={t('stat-points')}
                  name="statPoints"
                  value={formData.powerLevel.statPoints ?? DEFAULT_POWER_LEVEL.statPoints}
                  onChange={(e) => handlePowerLevelChange('statPoints', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="knack-count"
                label={t('knack-count')}
                defaultValue={DEFAULT_POWER_LEVEL.knackCount}
              >
                <NumericInput
                  label={t('knack-count')}
                  name="knackCount"
                  value={formData.powerLevel.knackCount ?? DEFAULT_POWER_LEVEL.knackCount}
                  onChange={(e) => handlePowerLevelChange('knackCount', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
            </Grid>
            <Grid size={gridSize}>
              <GameOptionField
                option="knack-bonus"
                label={t('knack-bonus')}
                defaultValue={DEFAULT_POWER_LEVEL.knackBonus}
              >
                <NumericInput
                  label={t('knack-bonus')}
                  name="knackBonus"
                  value={formData.powerLevel.knackBonus ?? DEFAULT_POWER_LEVEL.knackBonus}
                  onChange={(e) => handlePowerLevelChange('knackBonus', e || 0)}
                  integer
                  allowNegatives={false}
                />
              </GameOptionField>
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
