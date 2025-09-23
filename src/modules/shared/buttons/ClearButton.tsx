import React, { FC, MouseEvent } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

const ClearButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="add" disabled={disabled} size="large" color="primary">
    <ClearIcon fontSize="inherit" />
  </IconButton>
);

export default ClearButton;
