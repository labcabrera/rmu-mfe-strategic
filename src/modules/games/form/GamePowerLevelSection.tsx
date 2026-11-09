import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import {
  EnumPicker,
  NumericInput,
  POWER_LEVEL_PRESETS,
  PowerLevelPreset,
  Section,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { applyPowerLevelPreset, DEFAULT_POWER_LEVEL } from '../../services/game-rules';
import { GameOptionField } from '../GameOptionHint';
import { GameFormSectionProps, gridSize, wideSize } from './game-form-section';

type PowerField =
  | 'baseDevPoints'
  | 'statRandomMin'
  | 'statBoostPotential'
  | 'statBoostTemporary'
  | 'statCreationBoost'
  | 'statCreationSwap'
  | 'maxTraitCost'
  | 'raceDevPointsPerLevel'
  | 'creationBonusDevPoints'
  | 'statPoints'
  | 'knackCount'
  | 'knackBonus';

/** The numeric values of the power level, in order; the option key doubles as the label and hint key. */
const POWER_FIELDS: { option: string; field: PowerField; fallback?: boolean }[] = [
  { option: 'base-dev-points', field: 'baseDevPoints' },
  { option: 'stat-random-min', field: 'statRandomMin' },
  { option: 'stat-boost-potential', field: 'statBoostPotential' },
  { option: 'stat-boost-temporary', field: 'statBoostTemporary' },
  { option: 'stat-creation-boosts', field: 'statCreationBoost' },
  { option: 'stat-creation-swaps', field: 'statCreationSwap' },
  { option: 'max-trait-cost', field: 'maxTraitCost', fallback: true },
  { option: 'race-dev-points-per-level', field: 'raceDevPointsPerLevel', fallback: true },
  { option: 'creation-bonus-dev-points', field: 'creationBonusDevPoints', fallback: true },
  { option: 'stat-points', field: 'statPoints', fallback: true },
  { option: 'knack-count', field: 'knackCount', fallback: true },
  { option: 'knack-bonus', field: 'knackBonus', fallback: true },
];

/** The power level of the game: a preset (spec 079, table 12-1) that fills the values, which stay editable. */
const GamePowerLevelSection: FC<GameFormSectionProps> = ({ formData, setFormData }) => {
  const { t } = useTranslation();

  const handlePowerLevelChange = (field: string, value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      powerLevel: {
        ...prevData.powerLevel,
        [field]: value,
      },
    }));
  };

  const handlePresetChange = (preset: PowerLevelPreset | null) =>
    setFormData((prevData) => ({ ...prevData, powerLevel: applyPowerLevelPreset(prevData.powerLevel, preset) }));

  return (
    <Section title={t('power-level')}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="body2" color="text.secondary">
            {t('game-power-level-intro')}
          </Typography>
        </Grid>
        <Grid size={wideSize}>
          <GameOptionField option="power-level-preset" label={t('power-level-preset')}>
            <EnumPicker
              label={t('power-level-preset')}
              name="powerLevelPreset"
              variant="select"
              values={POWER_LEVEL_PRESETS}
              labelPrefix="power-level-"
              descriptionPrefix="power-level-preset-help-"
              value={formData.powerLevel.preset ?? null}
              onChange={(preset) => handlePresetChange((preset as PowerLevelPreset | null) ?? null)}
            />
          </GameOptionField>
        </Grid>
        <Grid size={wideSize}>
          <GameOptionField
            option="pp-recovery-percent"
            label={t('pp-recovery-percent')}
            defaultValue={DEFAULT_POWER_LEVEL.ppRecoveryPercent}
          >
            <NumericInput
              label={t('pp-recovery-percent')}
              name="ppRecoveryPercent"
              value={formData.powerLevel.ppRecoveryPercent ?? DEFAULT_POWER_LEVEL.ppRecoveryPercent}
              onChange={(e) => handlePowerLevelChange('ppRecoveryPercent', Math.min(100, e || 0))}
              integer
              min={0}
              max={100}
              allowNegatives={false}
            />
          </GameOptionField>
        </Grid>
        {POWER_FIELDS.map(({ option, field, fallback }) => (
          <Grid size={gridSize} key={field}>
            <GameOptionField option={option} label={t(option)} defaultValue={DEFAULT_POWER_LEVEL[field]}>
              <NumericInput
                label={t(option)}
                name={field}
                value={
                  fallback ? (formData.powerLevel[field] ?? DEFAULT_POWER_LEVEL[field]) : formData.powerLevel[field]
                }
                onChange={(e) => handlePowerLevelChange(field, e || 0)}
                integer
                allowNegatives={false}
              />
            </GameOptionField>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
};

export default GamePowerLevelSection;
