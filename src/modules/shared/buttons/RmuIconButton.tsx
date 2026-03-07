import React, { FC, MouseEvent } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme, useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';

type Props = {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  Icon?: React.ElementType;
  ariaLabel?: string;
  disabled?: boolean;
};

const RmuIconButton: FC<Props> = ({ onClick, Icon = RefreshIcon, ariaLabel = 'action', disabled = false }) => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const btnSize: 'small' | 'medium' = isSmDown ? 'small' : 'medium';
  const iconFontSize: 'small' | 'inherit' = isSmDown ? 'small' : 'inherit';

  const IconComp = Icon as React.ElementType;

  return (
    <IconButton onClick={onClick} aria-label={ariaLabel} size={btnSize} color="primary" disabled={disabled}>
      <IconComp fontSize={iconFontSize} />
    </IconButton>
  );
};

export default RmuIconButton;
