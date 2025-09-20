import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { StrategicGame } from '../../api/strategic-game.dto';

const GameAvatar: FC<{
  strategicGame: StrategicGame;
  size?: number;
}> = ({ strategicGame, size = 70 }) => {
  const defaultImage = '/static/images/generic/strategic.png';

  if (!strategicGame) return <p>Loading...</p>;

  const resolveImage = (): string => {
    return defaultImage;
  };

  return <Avatar src={resolveImage()} sx={{ width: size, height: size }} />;
};

export default GameAvatar;
