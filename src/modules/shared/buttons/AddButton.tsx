import React, { FC, MouseEvent } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RmuIconButton from './RmuIconButton';

const AddButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} ariaLabel="add" icon={AddCircleIcon} disabled={disabled} />
);

export default AddButton;
