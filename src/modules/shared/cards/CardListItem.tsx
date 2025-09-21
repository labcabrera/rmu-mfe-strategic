import React, { FC } from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

const CardListItem: FC<{
  title: string;
  subtitle: string;
  image: string;
  maxWidth?: number;
  minWidth?: number;
  height?: number;
  imageSize?: number;
  onClick?: () => void;
}> = ({ title, subtitle, image, onClick, maxWidth = 400, minWidth = 400, height = 100, imageSize = 100 }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        maxWidth: { maxWidth },
        minWidth: { minWidth },
        height: { height },
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, background 0.2s',
        '&:hover': {
          boxShadow: 6,
          backgroundColor: 'action.hover',
        },
      }}
    >
      <CardMedia component="img" image={image} alt={title} sx={{ width: imageSize, height: imageSize, objectFit: 'cover' }} />
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            display: 'block',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
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

export default CardListItem;
