import React, { FC, MouseEvent } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { RmuIconButton } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';

const LevelUpButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' | undefined;
}> = ({ color = 'primary', onClick }) => {
  return <RmuIconButton onClick={onClick} ariaLabel="level-up" Icon={ArrowCircleUpIcon} />;
};

export default LevelUpButton;
