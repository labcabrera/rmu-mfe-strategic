import React, { FC, MouseEvent } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';

const SaveButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="save" disabled={disabled} size="large" color="primary">
    <SaveIcon fontSize="inherit" />
  </IconButton>
);

export default SaveButton;
