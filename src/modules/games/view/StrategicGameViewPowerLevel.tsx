import React, { FC } from 'react';
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

  const row = (option: string, label: string, key: keyof typeof DEFAULT_POWER_LEVEL): GameOptionRow => ({
    option,
    label: t(label),
    value: powerLevel[key],
    defaultValue: DEFAULT_POWER_LEVEL[key],
  });

  const rows: GameOptionRow[] = [
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
