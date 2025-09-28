import React, { FC, MouseEvent } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';

const RefreshButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}> = ({ onClick }) => (
  <IconButton onClick={onClick} aria-label="refresh" size="large" color="primary">
    <RefreshIcon fontSize="inherit" />
  </IconButton>
);

export default RefreshButton;
