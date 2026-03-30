import React, { FC, MouseEvent } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import RmuIconButton from './RmuIconButton';

const LevelUpButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' | undefined;
}> = ({ color = 'primary', onClick }) => {
  return <RmuIconButton onClick={onClick} ariaLabel="level-up" color={color} icon={ArrowCircleUpIcon} />;
};

export default LevelUpButton;
