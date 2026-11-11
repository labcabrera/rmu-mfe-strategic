import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValuePanel, OptionsHelpButton, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_POWER_LEVEL, resolvePowerLevel } from '../../services/game-rules';
import { GameOptionRow, gameOptionsHelp } from '../GameOptionHint';

/**
 * Power level of a campaign as label / value rows: development points, stat generation, traits and knacks, with one
 * help button in the header that explains every option (spec 066, decision 17).
 */
const StrategicGameViewPowerLevel: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);

  const row = (
    option: string,
    label: string,
    key: Exclude<keyof typeof DEFAULT_POWER_LEVEL, 'preset'>
  ): GameOptionRow => ({
    option,
    label: t(label),
    value: powerLevel[key],
    defaultValue: DEFAULT_POWER_LEVEL[key],
  });

  const rows: GameOptionRow[] = [
    {
      option: 'power-level-preset',
      label: t('power-level-preset'),
      value: powerLevel.preset ? t(`power-level-${powerLevel.preset}`) : t('power-level-preset-custom'),
      // The help shows t('power-level-preset-custom')
      defaultValue: 'custom',
    },
    row('base-dev-points', 'dev-points', 'baseDevPoints'),
    row('race-dev-points-per-level', 'race-dev-points-per-level', 'raceDevPointsPerLevel'),
    row('creation-bonus-dev-points', 'creation-bonus-dev-points', 'creationBonusDevPoints'),
    row('stat-points', 'stat-points', 'statPoints'),
    row('stat-random-min', 'stat-random-min', 'statRandomMin'),
    row('stat-boost-potential', 'stat-boost-potential', 'statBoostPotential'),
    row('stat-boost-temporary', 'stat-boost-temporary', 'statBoostTemporary'),
    row('stat-creation-boosts', 'stat-creation-boosts', 'statCreationBoost'),
    row('stat-creation-swaps', 'stat-creation-swaps', 'statCreationSwap'),
    row('max-trait-cost', 'max-trait-cost', 'maxTraitCost'),
    row('knack-count', 'knack-count', 'knackCount'),
    row('knack-bonus', 'knack-bonus', 'knackBonus'),
    {
      ...row('pp-recovery-percent', 'pp-recovery-percent', 'ppRecoveryPercent'),
      value: `${powerLevel.ppRecoveryPercent}%`,
    },
  ];

  return (
    <KeyValuePanel
      title={t('power-level')}
      extra={<OptionsHelpButton title={t('power-level')} options={gameOptionsHelp(rows, t)} />}
      rows={rows.map(({ label, value }) => ({ label, value }))}
    />
  );
};

export default StrategicGameViewPowerLevel;
