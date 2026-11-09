import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValuePanel, OptionsHelpButton, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_OPTIONS, resolveOptions } from '../../services/game-rules';
import { GameOptionRow, gameOptionsHelp } from '../GameOptionHint';

/**
 * Options of a campaign as label / value rows (multipliers, lethality and the creation and combat rules), with one
 * help button in the header that explains every option (spec 066, decision 17).
 */
const StrategicGameViewAttributes: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const options = resolveOptions(strategicGame.options);
  const yesNo = (value: boolean) => t(value ? 'yes' : 'no');

  const rows: GameOptionRow[] = [
    {
      option: 'experience-multiplier',
      label: t('experience-multiplier'),
      value: `×${strategicGame.options.experienceMultiplier}`,
      defaultValue: DEFAULT_OPTIONS.experienceMultiplier,
    },
    {
      option: 'fatigue-multiplier',
      label: t('fatigue-multiplier'),
      value: `×${strategicGame.options.fatigueMultiplier}`,
      defaultValue: DEFAULT_OPTIONS.fatigueMultiplier,
    },
    {
      option: 'board-scale',
      label: t('board-scale'),
      value: `×${strategicGame.options.boardScaleMultiplier}`,
      defaultValue: DEFAULT_OPTIONS.boardScaleMultiplier,
    },
    {
      option: 'letality',
      label: t('letality'),
      value: strategicGame.options.letality,
      defaultValue: DEFAULT_OPTIONS.letality,
    },
    {
      option: 'talent-policy',
      label: t('talent-policy'),
      value: t(`talent-policy-${options.talentPolicy}`),
      defaultValue: DEFAULT_OPTIONS.talentPolicy,
    },
    {
      option: 'stat-generation',
      label: t('stat-generation'),
      value: t(`stat-generation-${options.statGeneration}`),
      defaultValue: DEFAULT_OPTIONS.statGeneration,
    },
    {
      option: 'starting-wealth',
      label: t('starting-wealth'),
      value: t(`starting-wealth-${options.startingWealth}`),
      defaultValue: DEFAULT_OPTIONS.startingWealth,
    },
    {
      option: 'intense-training',
      label: t('intense-training'),
      value: yesNo(options.intenseTraining),
      defaultValue: DEFAULT_OPTIONS.intenseTraining,
    },
    {
      option: 'allow-saving-dev-points',
      label: t('allow-saving-dev-points'),
      value: yesNo(options.allowSavingDevPoints),
      defaultValue: DEFAULT_OPTIONS.allowSavingDevPoints,
    },
    {
      option: 'bonus-dev-points-cap-at-creation',
      label: t('bonus-dev-points-cap-at-creation'),
      value: yesNo(options.bonusDevPointsCapAtCreation),
      defaultValue: DEFAULT_OPTIONS.bonusDevPointsCapAtCreation,
    },
    {
      option: 'open-rounds',
      label: t('open-rounds'),
      value: yesNo(options.openRounds),
      defaultValue: DEFAULT_OPTIONS.openRounds,
    },
    {
      option: 'talent-purchase-rules',
      label: t('talent-purchase-rules'),
      value: yesNo(options.talentPurchaseRules),
      defaultValue: DEFAULT_OPTIONS.talentPurchaseRules,
    },
  ];

  return (
    <KeyValuePanel
      title={t('settings')}
      extra={<OptionsHelpButton title={t('settings')} options={gameOptionsHelp(rows, t)} />}
      rows={rows.map(({ label, value }) => ({ label, value }))}
    />
  );
};

export default StrategicGameViewAttributes;
