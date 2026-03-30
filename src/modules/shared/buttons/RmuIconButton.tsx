import React, { FC, MouseEvent } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme, useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';

type Props = {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ElementType;
  ariaLabel?: string;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' | undefined;
};

const RmuIconButton: FC<Props> = ({
  onClick,
  icon = RefreshIcon,
  ariaLabel = 'action',
  color = 'primary',
  disabled = false,
}) => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const btnSize: 'small' | 'medium' = isSmDown ? 'small' : 'medium';
  const iconFontSize: 'small' | 'inherit' = isSmDown ? 'small' : 'inherit';
  const IconComp = icon as React.ElementType;

  return (
    <IconButton onClick={onClick} aria-label={ariaLabel} size={btnSize} color={color} disabled={disabled}>
      <IconComp fontSize={iconFontSize} />
    </IconButton>
  );
};

export default RmuIconButton;
