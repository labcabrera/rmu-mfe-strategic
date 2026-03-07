import React, { FC, MouseEvent } from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import RmuIconButton from './RmuIconButton';

const LevelUpButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}> = ({ onClick }) => {
  return <RmuIconButton onClick={onClick} ariaLabel="level-up" Icon={ArrowCircleUpIcon} />;
};

export default LevelUpButton;
