import React, { FC, MouseEvent } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';

const AddButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="add" disabled={disabled} size="large" color="primary">
    <AddCircleIcon fontSize="inherit" />
  </IconButton>
);

export default AddButton;
