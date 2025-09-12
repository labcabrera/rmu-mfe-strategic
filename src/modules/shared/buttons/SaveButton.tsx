import React, { FC, MouseEvent } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';

interface SaveButtonProps {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const SaveButton: FC<SaveButtonProps> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="save" disabled={disabled} size="large">
    <SaveIcon fontSize="inherit" />
  </IconButton>
);

export default SaveButton;
