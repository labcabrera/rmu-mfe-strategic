import React, { FC, ReactNode } from 'react';
import { Card, CardContent, CardMedia } from '@mui/material';

const smallImageSize = 70;
const mediumImageSize = 100;

const RmuCard: FC<{
  image: string;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  size?: 'small' | 'medium';
  onClick?: () => void;
  children?: ReactNode;
  grayscale?: number;
}> = ({ image, onClick, size = 'medium', children, grayscale = 0 }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        height: size === 'small' ? smallImageSize : mediumImageSize,
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick && {
          transition: 'box-shadow 0.2s, background 0.2s',
          '&:hover': {
            boxShadow: 6,
            backgroundColor: 'action.hover',
          },
        }),
      }}
    >
      <CardMedia
        component="img"
        image={image}
        sx={{
          width: size === 'small' ? smallImageSize : mediumImageSize,
          height: size === 'small' ? smallImageSize : mediumImageSize,
          objectFit: 'cover',
          filter: `grayscale(${grayscale})`,
        }}
      />
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          '&:last-child': {
            pb: 0,
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ml: 2,
          // mb: 0,
          // paddingBottom: 0,
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default RmuCard;
