import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Chip, Tooltip } from '@mui/material';

/** Marks a skill or trait of an imported character that does not exist in this installation (spec 024). */
const MissingReferenceChip: FC = () => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('missing-reference-help')}>
      <Chip
        size="small"
        color="warning"
        variant="outlined"
        icon={<WarningAmberIcon />}
        label={t('missing-reference')}
        sx={{ ml: 1 }}
      />
    </Tooltip>
  );
};

export default MissingReferenceChip;
