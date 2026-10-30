import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValuePanel, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_POWER_LEVEL, resolvePowerLevel } from '../../services/game-rules';
import { GameOptionLabel } from '../GameOptionHint';

/** Power level of a campaign as label / value rows: development points, stat generation, traits and knacks. */
const StrategicGameViewPowerLevel: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);

  return (
    <KeyValuePanel
      title={t('power-level')}
      rows={[
        {
          label: (
            <GameOptionLabel
              option="base-dev-points"
              label={t('dev-points')}
              defaultValue={DEFAULT_POWER_LEVEL.baseDevPoints}
            />
          ),
          value: powerLevel.baseDevPoints,
        },
        {
          label: (
            <GameOptionLabel
              option="race-dev-points-per-level"
              label={t('race-dev-points-per-level')}
              defaultValue={DEFAULT_POWER_LEVEL.raceDevPointsPerLevel}
            />
          ),
          value: powerLevel.raceDevPointsPerLevel,
        },
        {
          label: (
            <GameOptionLabel
              option="creation-bonus-dev-points"
              label={t('creation-bonus-dev-points')}
              defaultValue={DEFAULT_POWER_LEVEL.creationBonusDevPoints}
            />
          ),
          value: powerLevel.creationBonusDevPoints,
        },
        {
          label: (
            <GameOptionLabel
              option="stat-points"
              label={t('stat-points')}
              defaultValue={DEFAULT_POWER_LEVEL.statPoints}
            />
          ),
          value: powerLevel.statPoints,
        },
        {
          label: (
            <GameOptionLabel
              option="stat-random-min"
              label={t('stat-random-min')}
              defaultValue={DEFAULT_POWER_LEVEL.statRandomMin}
            />
          ),
          value: powerLevel.statRandomMin,
        },
        {
          label: (
            <GameOptionLabel
              option="stat-boost-potential"
              label={t('stat-boost-potential')}
              defaultValue={DEFAULT_POWER_LEVEL.statBoostPotential}
            />
          ),
          value: powerLevel.statBoostPotential,
        },
        {
          label: (
            <GameOptionLabel
              option="stat-boost-temporary"
              label={t('stat-boost-temporary')}
              defaultValue={DEFAULT_POWER_LEVEL.statBoostTemporary}
            />
          ),
          value: powerLevel.statBoostTemporary,
        },
        {
          label: (
            <GameOptionLabel
              option="stat-creation-boosts"
              label={t('stat-creation-boosts')}
              defaultValue={DEFAULT_POWER_LEVEL.statCreationBoost}
            />
          ),
          value: powerLevel.statCreationBoost,
        },
        {
          label: (
            <GameOptionLabel
              option="stat-creation-swaps"
              label={t('stat-creation-swaps')}
              defaultValue={DEFAULT_POWER_LEVEL.statCreationSwap}
            />
          ),
          value: powerLevel.statCreationSwap,
        },
        {
          label: (
            <GameOptionLabel
              option="max-trait-cost"
              label={t('max-trait-cost')}
              defaultValue={DEFAULT_POWER_LEVEL.maxTraitCost}
            />
          ),
          value: powerLevel.maxTraitCost,
        },
        {
          label: (
            <GameOptionLabel
              option="knack-count"
              label={t('knack-count')}
              defaultValue={DEFAULT_POWER_LEVEL.knackCount}
            />
          ),
          value: powerLevel.knackCount,
        },
        {
          label: (
            <GameOptionLabel
              option="knack-bonus"
              label={t('knack-bonus')}
              defaultValue={DEFAULT_POWER_LEVEL.knackBonus}
            />
          ),
          value: powerLevel.knackBonus,
        },
      ]}
    />
  );
};

export default StrategicGameViewPowerLevel;
