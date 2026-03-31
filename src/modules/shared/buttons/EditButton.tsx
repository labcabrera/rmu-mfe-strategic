import React, { FC, MouseEvent } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { t } from 'i18next';
import RmuIconButton from './RmuIconButton';

const EditButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="edit" disabled={disabled} icon={EditDocumentIcon} tooltip={t('Edit')} />
);

export default EditButton;
