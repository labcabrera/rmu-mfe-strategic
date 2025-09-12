import React, { FC, MouseEvent } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const DeleteButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="delete" disabled={disabled} size="large">
    <DeleteIcon fontSize="inherit" />
  </IconButton>
);

export default DeleteButton;
