import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import { StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_OPTIONS, resolveOptions, resolvePowerLevel } from '../../services/game-rules';
import TalentPolicyChip from '../../shared/chips/TalentPolicyChip';

/**
 * Chips of a campaign card: the status, the power level (development points per level) and the options that differ
 * from the defaults (closed rounds, talent policy).
 */
const StrategicGameCardChips: FC<{ strategicGame: StrategicGame }> = ({ strategicGame }) => {
  const { t } = useTranslation();
  const options = resolveOptions(strategicGame.options);
  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);
  return (
    <>
      {strategicGame.status && (
        <Chip
          size="small"
          color={strategicGame.status === 'open' ? 'success' : 'default'}
          label={t(strategicGame.status)}
        />
      )}
      <Tooltip title={t('power-level')}>
        <Chip size="small" variant="outlined" label={t('power-level-dp', { dp: powerLevel.baseDevPoints })} />
      </Tooltip>
      {options.openRounds !== DEFAULT_OPTIONS.openRounds && (
        <Chip size="small" variant="outlined" label={t(options.openRounds ? 'open-rounds-short' : 'closed-rounds')} />
      )}
      {options.talentPolicy !== DEFAULT_OPTIONS.talentPolicy && <TalentPolicyChip policy={options.talentPolicy} />}
    </>
  );
};

export default StrategicGameCardChips;
