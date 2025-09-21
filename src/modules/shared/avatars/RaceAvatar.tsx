import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { Character } from '../../api/character.dto';
import { resolveRaceImage } from '../../services/race-avatar-service';

const RaceAvatar: FC<{
  raceName?: string;
  size?: number;
}> = ({ raceName, size = 70 }) => {
  const defaultImage = '/static/images/races/unknown.png';

  return <Avatar src={resolveRaceImage(raceName)} sx={{ width: size, height: size }} />;
};

export default RaceAvatar;
