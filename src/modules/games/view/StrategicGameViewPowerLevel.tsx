import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValuePanel, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolvePowerLevel } from '../../services/game-rules';

/** Power level of a campaign as label / value rows: development points, stat generation, traits and knacks. */
const StrategicGameViewPowerLevel: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);

  return (
    <KeyValuePanel
      title={t('power-level')}
      rows={[
        { label: t('dev-points'), value: powerLevel.baseDevPoints },
        { label: t('race-dev-points-per-level'), value: powerLevel.raceDevPointsPerLevel },
        { label: t('creation-bonus-dev-points'), value: powerLevel.creationBonusDevPoints },
        { label: t('stat-points'), value: powerLevel.statPoints },
        { label: t('stat-random-min'), value: powerLevel.statRandomMin },
        { label: t('stat-boost-potential'), value: powerLevel.statBoostPotential },
        { label: t('stat-boost-temporary'), value: powerLevel.statBoostTemporary },
        { label: t('stat-creation-boosts'), value: powerLevel.statCreationBoost },
        { label: t('stat-creation-swaps'), value: powerLevel.statCreationSwap },
        { label: t('max-trait-cost'), value: powerLevel.maxTraitCost },
        { label: t('knack-count'), value: powerLevel.knackCount },
        { label: t('knack-bonus'), value: powerLevel.knackBonus },
      ]}
    />
  );
};

export default StrategicGameViewPowerLevel;
