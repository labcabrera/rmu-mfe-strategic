import React, { FC, MouseEvent } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import RmuIconButton from './RmuIconButton';

const EditButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="edit" disabled={disabled} icon={EditDocumentIcon} />
);

export default EditButton;
