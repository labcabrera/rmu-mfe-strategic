import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import { TalentPolicy } from '@labcabrera-rmu/rmu-react-shared-lib';

/** The talent policy of a game as a chip, with a tooltip that explains how talents are paid under it. */
const TalentPolicyChip: FC<{ policy: TalentPolicy; size?: 'small' | 'medium' }> = ({ policy, size = 'small' }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(`talent-policy-${policy}-help`)}>
      <Chip size={size} variant="outlined" label={t(`talent-policy-${policy}`)} />
    </Tooltip>
  );
};

export default TalentPolicyChip;
