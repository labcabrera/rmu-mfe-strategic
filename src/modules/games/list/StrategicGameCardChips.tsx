import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import { StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_OPTIONS, resolveOptions, resolvePowerLevel } from '../../services/game-rules';
import TalentPolicyChip from '../../shared/chips/TalentPolicyChip';

/**
 * Chips of a campaign card: the status, the power level (development points per level) and the options that differ
 * from the defaults (closed rounds, talent policy). The header of the campaign view shows them medium, as its other
 * chips.
 */
const StrategicGameCardChips: FC<{ strategicGame: StrategicGame; size?: 'small' | 'medium' }> = ({
  strategicGame,
  size = 'small',
}) => {
  const { t } = useTranslation();
  const options = resolveOptions(strategicGame.options);
  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);
  return (
    <>
      {strategicGame.status && (
        <Chip
          size={size}
          color={strategicGame.status === 'open' ? 'success' : 'default'}
          label={t(strategicGame.status)}
        />
      )}
      {powerLevel.preset && (
        <Tooltip title={t('power-level-preset')}>
          <Chip size={size} variant="outlined" color="primary" label={t(`power-level-${powerLevel.preset}`)} />
        </Tooltip>
      )}
      <Tooltip title={t('power-level')}>
        <Chip size={size} variant="outlined" label={t('power-level-dp', { dp: powerLevel.baseDevPoints })} />
      </Tooltip>
      {options.openRounds !== DEFAULT_OPTIONS.openRounds && (
        <Chip size={size} variant="outlined" label={t(options.openRounds ? 'open-rounds-short' : 'closed-rounds')} />
      )}
      {options.talentPolicy !== DEFAULT_OPTIONS.talentPolicy && (
        <TalentPolicyChip policy={options.talentPolicy} size={size} />
      )}
      {options.talentPurchaseRules && <Chip size={size} variant="outlined" label={t('talent-purchase-rules-short')} />}
      {options.startingWealth !== DEFAULT_OPTIONS.startingWealth && (
        <Tooltip title={t('starting-wealth')}>
          <Chip size={size} variant="outlined" label={t(`starting-wealth-${options.startingWealth}`)} />
        </Tooltip>
      )}
    </>
  );
};

export default StrategicGameCardChips;
