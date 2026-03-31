import React, { FC, MouseEvent } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { t } from 'i18next';
import RmuIconButton from './RmuIconButton';

const LevelUpButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' | undefined;
}> = ({ color = 'primary', onClick }) => {
  return (
    <RmuIconButton
      onClick={onClick}
      ariaLabel="level-up"
      color={color}
      icon={ArrowCircleUpIcon}
      tooltip={t('Level up')}
    />
  );
};

export default LevelUpButton;
