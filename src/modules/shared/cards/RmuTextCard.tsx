import React, { FC } from 'react';
import { Typography } from '@mui/material';
import { imageBaseUrl } from '../../services/config';
import RmuCard from './RmuCard';

const red = '#ffab91';
const green = '#a5d6a7';

const RmuTextCard: FC<{
  value: string | number;
  applyColor?: boolean;
  subtitle: string | undefined;
  image?: string;
  grayscale?: number;
  size?: 'small' | 'medium';
  onClick?: () => void;
}> = ({
  value,
  subtitle,
  size = 'small',
  applyColor = false,
  image = `${imageBaseUrl}images/generic/configuration.png`,
  grayscale = 0,
  onClick,
}) => {
  return (
    <RmuCard image={image} onClick={onClick} size={size} grayscale={grayscale}>
      <Typography
        component="div"
        variant="h6"
        sx={{
          color:
            applyColor && typeof value === 'number'
              ? value > 0
                ? green
                : value < 0
                  ? red
                  : 'text.primary'
              : undefined,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="subtitle1"
        component="div"
        sx={{
          fontSize: '1rem',
          color: applyColor ? 'primary.main' : 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {subtitle}
      </Typography>
    </RmuCard>
  );
};

export default RmuTextCard;
