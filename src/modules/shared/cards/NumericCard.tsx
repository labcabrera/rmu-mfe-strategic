import React, { FC } from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

const NumericCard: FC<{
  value: number;
  subtitle: string;
  image: string;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  grayscale?: number;
  applyColor?: boolean;
  applyFormat?: boolean;
}> = ({
  value,
  subtitle,
  image,
  maxWidth = 250,
  minWidth = 250,
  height = 70,
  imageSize = 70,
  grayscale = 0.5,
  applyColor = true,
  applyFormat = false,
}) => {
  const red = '#ffab91';
  const green = '#a5d6a7';

  const formattedValue = value ? new Intl.NumberFormat('en-EN').format(value) : '';

  const getColor = (): string => {
    if (!applyColor) return 'inherit';
    if (value > 0) return green;
    if (value < 0) return red;
    return 'inherit';
  };

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: { maxWidth },
        minWidth: { minWidth },
        height: { height },
      }}
    >
      <CardMedia
        component="img"
        image={image}
        alt={subtitle}
        sx={{ width: imageSize, height: imageSize, objectFit: 'cover', filter: `grayscale(${grayscale})` }}
      />
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ml: 2,
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <Typography
          component="div"
          variant="h6"
          sx={{
            mt: 2,
            color: getColor(),
            // fontSize: '1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {applyFormat ? formattedValue : value}
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
      </CardContent>
    </Card>
  );
};

export default NumericCard;
