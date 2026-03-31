import React, { FC, MouseEvent } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { t } from 'i18next';
import RmuIconButton from './RmuIconButton';

const RefreshButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' | undefined;
}> = ({ onClick, color = 'primary' }) => {
  return (
    <RmuIconButton onClick={onClick} ariaLabel="refresh" color={color} icon={RefreshIcon} tooltip={t('Refresh')} />
  );
};

export default RefreshButton;
