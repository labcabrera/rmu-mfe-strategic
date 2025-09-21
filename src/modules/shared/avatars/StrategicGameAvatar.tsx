import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { StrategicGame } from '../../api/strategic-game.dto';
import { defaultStrategicGameImage } from '../../services/image-service';

const GameAvatar: FC<{
  strategicGame: StrategicGame;
  size?: number;
  onClick?: () => void;
}> = ({ strategicGame, size = 70, onClick }) => {
  if (!strategicGame) return <p>Loading...</p>;

  const resolveImage = (): string => {
    return strategicGame.imageUrl ? strategicGame.imageUrl : defaultStrategicGameImage;
  };

  return (
    <Avatar
      src={resolveImage()}
      onClick={onClick}
      sx={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};

export default GameAvatar;
