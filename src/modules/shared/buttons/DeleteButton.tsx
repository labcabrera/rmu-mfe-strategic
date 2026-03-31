import React, { FC, MouseEvent } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { t } from 'i18next';
import RmuIconButton from './RmuIconButton';

const DeleteButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="delete" disabled={disabled} icon={DeleteIcon} tooltip={t('Delete')} />
);

export default DeleteButton;
