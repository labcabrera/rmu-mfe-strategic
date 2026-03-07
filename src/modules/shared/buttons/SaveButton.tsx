import React, { FC, MouseEvent } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import RmuIconButton from './RmuIconButton';

const SaveButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="save" disabled={disabled} Icon={SaveIcon} />
);

export default SaveButton;
