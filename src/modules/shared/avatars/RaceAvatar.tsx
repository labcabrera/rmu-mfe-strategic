import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { imageBaseUrl } from '../../services/config';
import { resolveRaceImage } from '../../services/race-avatar-service';

const RaceAvatar: FC<{
  imageUrl?: string;
  raceName?: string;
  size?: number;
  onClick?: () => void;
}> = ({ imageUrl, raceName, size = 70, onClick }) => {
  const defaultImage = `${imageBaseUrl}images/races/unknown.png`;

  return (
    <Avatar
      src={imageUrl || resolveRaceImage(raceName) || defaultImage}
      sx={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    />
  );
};

export default RaceAvatar;
