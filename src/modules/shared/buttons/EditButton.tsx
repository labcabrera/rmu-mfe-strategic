import React, { FC, MouseEvent } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import IconButton from '@mui/material/IconButton';

const EditButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <IconButton onClick={onClick} aria-label="edit" disabled={disabled} size="large" color="primary">
    <EditDocumentIcon fontSize="inherit" />
  </IconButton>
);

export default EditButton;
