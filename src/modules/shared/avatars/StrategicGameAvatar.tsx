import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { StrategicGame } from '../../api/strategic-game.dto';

const GameAvatar: FC<{
  strategicGame: StrategicGame;
  size?: number;
  onClick?: () => void;
}> = ({ strategicGame, size = 70, onClick }) => {
  const defaultImage = '/static/images/generic/strategic.png';

  if (!strategicGame) return <p>Loading...</p>;

  const resolveImage = (): string => {
    return defaultImage;
  };

  return <Avatar src={resolveImage()} onClick={onClick} sx={{ width: size, height: size }} />;
};

export default GameAvatar;
