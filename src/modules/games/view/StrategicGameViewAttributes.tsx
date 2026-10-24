import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValuePanel, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveOptions } from '../../services/game-rules';

/** Options of a campaign as label / value rows (multipliers, lethality and the creation and combat rules). */
const StrategicGameViewAttributes: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const options = resolveOptions(strategicGame.options);
  const yesNo = (value: boolean) => t(value ? 'yes' : 'no');

  return (
    <KeyValuePanel
      title={t('settings')}
      rows={[
        { label: t('experience-multiplier'), value: `×${strategicGame.options.experienceMultiplier}` },
        { label: t('fatigue-multiplier'), value: `×${strategicGame.options.fatigueMultiplier}` },
        { label: t('board-scale'), value: `×${strategicGame.options.boardScaleMultiplier}` },
        { label: t('letality'), value: strategicGame.options.letality },
        { label: t('talent-policy'), value: t(`talent-policy-${options.talentPolicy}`) },
        { label: t('stat-generation'), value: t(`stat-generation-${options.statGeneration}`) },
        { label: t('allow-third-rank'), value: yesNo(options.allowThirdRank) },
        { label: t('bonus-dev-points-cap-at-creation'), value: yesNo(options.bonusDevPointsCapAtCreation) },
        { label: t('open-rounds'), value: yesNo(options.openRounds) },
      ]}
    />
  );
};

export default StrategicGameViewAttributes;
