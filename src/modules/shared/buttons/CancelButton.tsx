import React, { FC, MouseEvent } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';

const CancelButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="delete" disabled={disabled} size="large" color="primary">
    <CancelIcon fontSize="inherit" />
  </IconButton>
);

export default CancelButton;
