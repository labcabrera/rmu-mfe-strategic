import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import {
  EnumPicker,
  NumericInput,
  Section,
  STARTING_WEALTH_SP_PER_LEVEL,
  STARTING_WEALTHS,
  StartingWealth,
  STAT_GENERATIONS,
  StrategicGame,
  StrategicGameOptions,
  TALENT_POLICIES,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_OPTIONS } from '../../services/game-rules';
import { GameOptionField } from '../GameOptionHint';
import { GameFormSectionProps, gridSize, wideSize } from './game-form-section';

type BooleanOption =
  'intenseTraining' | 'allowSavingDevPoints' | 'bonusDevPointsCapAtCreation' | 'openRounds' | 'talentPurchaseRules';

/** One switch of the game options; the option key doubles as the label and hint key. */
const OptionSwitch: FC<{
  option: string;
  field: BooleanOption;
  checked?: boolean;
  formData: StrategicGame;
  onChange: (field: keyof StrategicGameOptions, value: boolean) => void;
}> = ({ option, field, checked, formData, onChange }) => {
  const { t } = useTranslation();
  return (
    <Grid size={wideSize}>
      <GameOptionField option={option} label={t(option)} defaultValue={DEFAULT_OPTIONS[field]}>
        <FormControlLabel
          control={
            <Switch
              name={field}
              checked={checked ?? !!formData.options[field]}
              onChange={(e) => onChange(field, e.target.checked)}
            />
          }
          label={t(option)}
        />
      </GameOptionField>
    </Grid>
  );
};

/** The options of the game: multipliers, policies and the optional rules. */
const GameSettingsSection: FC<GameFormSectionProps> = ({ formData, setFormData }) => {
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

  return (
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
        <Grid size={wideSize}>
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
        <Grid size={wideSize}>
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
        <Grid size={wideSize}>
          <GameOptionField
            option="starting-wealth"
            label={t('starting-wealth')}
            defaultValue={DEFAULT_OPTIONS.startingWealth}
          >
            <EnumPicker
              label={t('starting-wealth')}
              name="startingWealth"
              variant="select"
              values={STARTING_WEALTHS}
              labelPrefix="starting-wealth-"
              formatDescription={(wealth) =>
                wealth === 'none'
                  ? t('starting-wealth-none-help')
                  : t('starting-wealth-rate', { sp: STARTING_WEALTH_SP_PER_LEVEL[wealth as StartingWealth] })
              }
              value={formData.options.startingWealth ?? 'none'}
              onChange={(wealth) => wealth && handleOptionsChange('startingWealth', wealth)}
              required
            />
          </GameOptionField>
        </Grid>
        <OptionSwitch
          option="intense-training"
          field="intenseTraining"
          formData={formData}
          onChange={handleOptionsChange}
        />
        <OptionSwitch
          option="allow-saving-dev-points"
          field="allowSavingDevPoints"
          formData={formData}
          onChange={handleOptionsChange}
        />
        <OptionSwitch
          option="bonus-dev-points-cap-at-creation"
          field="bonusDevPointsCapAtCreation"
          formData={formData}
          onChange={handleOptionsChange}
        />
        <OptionSwitch
          option="open-rounds"
          field="openRounds"
          checked={formData.options.openRounds ?? true}
          formData={formData}
          onChange={handleOptionsChange}
        />
        <OptionSwitch
          option="talent-purchase-rules"
          field="talentPurchaseRules"
          formData={formData}
          onChange={handleOptionsChange}
        />
      </Grid>
    </Section>
  );
};

export default GameSettingsSection;
