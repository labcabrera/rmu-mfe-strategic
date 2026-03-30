import React, { FC } from 'react';
import { Typography } from '@mui/material';
import { imageBaseUrl } from '../../services/config';
import { textRed, textGreen } from '../../services/display';
import RmuCard from './RmuCard';

const RmuTextCard: FC<{
  value: string | number;
  color?: undefined | 'success' | 'error';
  subtitle: string | undefined;
  image?: string;
  grayscale?: number;
  size?: 'small' | 'medium';
  onClick?: () => void;
}> = ({
  value,
  subtitle,
  size = 'small',
  color,
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
          color: color === 'error' ? textRed : color === 'success' ? textGreen : undefined,
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
          color: 'text.secondary',
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
