import React, { FC, MouseEvent } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import RmuIconButton from './RmuIconButton';

const CancelButton: FC<{
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => (
  <RmuIconButton onClick={onClick} aria-label="cancel" disabled={disabled} icon={CancelIcon} />
);

export default CancelButton;
