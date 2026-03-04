import React, { FC, MouseEvent } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { t } from 'i18next';

const LevelUpButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  color: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}> = ({ onClick, disabled = false, color = 'primary' }) => (
  <Tooltip title={t('level-up')}>
    <IconButton onClick={onClick} aria-label="level-up" disabled={disabled} size="medium" color={color}>
      <ArrowCircleUpIcon fontSize="inherit" />
    </IconButton>
  </Tooltip>
);

export default LevelUpButton;
