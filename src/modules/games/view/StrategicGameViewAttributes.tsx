import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyValuePanel, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_OPTIONS, resolveOptions } from '../../services/game-rules';
import { GameOptionLabel } from '../GameOptionHint';

/** Options of a campaign as label / value rows (multipliers, lethality and the creation and combat rules). */
const StrategicGameViewAttributes: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const options = resolveOptions(strategicGame.options);
  const yesNo = (value: boolean) => t(value ? 'yes' : 'no');

  return (
    <KeyValuePanel
      title={t('settings')}
      rows={[
        {
          label: (
            <GameOptionLabel
              option="experience-multiplier"
              label={t('experience-multiplier')}
              defaultValue={DEFAULT_OPTIONS.experienceMultiplier}
            />
          ),
          value: `×${strategicGame.options.experienceMultiplier}`,
        },
        {
          label: (
            <GameOptionLabel
              option="fatigue-multiplier"
              label={t('fatigue-multiplier')}
              defaultValue={DEFAULT_OPTIONS.fatigueMultiplier}
            />
          ),
          value: `×${strategicGame.options.fatigueMultiplier}`,
        },
        {
          label: (
            <GameOptionLabel
              option="board-scale"
              label={t('board-scale')}
              defaultValue={DEFAULT_OPTIONS.boardScaleMultiplier}
            />
          ),
          value: `×${strategicGame.options.boardScaleMultiplier}`,
        },
        {
          label: <GameOptionLabel option="letality" label={t('letality')} defaultValue={DEFAULT_OPTIONS.letality} />,
          value: strategicGame.options.letality,
        },
        {
          label: (
            <GameOptionLabel
              option="talent-policy"
              label={t('talent-policy')}
              defaultValue={DEFAULT_OPTIONS.talentPolicy}
            />
          ),
          value: t(`talent-policy-${options.talentPolicy}`),
        },
        {
          label: (
            <GameOptionLabel
              option="stat-generation"
              label={t('stat-generation')}
              defaultValue={DEFAULT_OPTIONS.statGeneration}
            />
          ),
          value: t(`stat-generation-${options.statGeneration}`),
        },
        {
          label: (
            <GameOptionLabel
              option="allow-third-rank"
              label={t('allow-third-rank')}
              defaultValue={DEFAULT_OPTIONS.allowThirdRank}
            />
          ),
          value: yesNo(options.allowThirdRank),
        },
        {
          label: (
            <GameOptionLabel
              option="bonus-dev-points-cap-at-creation"
              label={t('bonus-dev-points-cap-at-creation')}
              defaultValue={DEFAULT_OPTIONS.bonusDevPointsCapAtCreation}
            />
          ),
          value: yesNo(options.bonusDevPointsCapAtCreation),
        },
        {
          label: (
            <GameOptionLabel option="open-rounds" label={t('open-rounds')} defaultValue={DEFAULT_OPTIONS.openRounds} />
          ),
          value: yesNo(options.openRounds),
        },
      ]}
    />
  );
};

export default StrategicGameViewAttributes;
