import React, { FC, MouseEvent } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import RmuIconButton from './RmuIconButton';

const RefreshButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}> = ({ onClick }) => {
  return <RmuIconButton onClick={onClick} ariaLabel="refresh" Icon={RefreshIcon} />;
};

export default RefreshButton;
