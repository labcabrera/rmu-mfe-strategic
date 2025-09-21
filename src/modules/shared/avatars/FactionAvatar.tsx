import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import { Faction } from '../../api/faction.dto';
import { defaultFactionImage } from '../../services/image-service';

const FactionAvatar: FC<{
  faction?: Faction;
  size?: number;
  onClick?(): void;
}> = ({ faction, onClick, size = 70 }) => {
  if (!faction) return <p>Loading...</p>;

  const resolveImage = (): string => {
    return faction.imageUrl ? faction.imageUrl : defaultFactionImage;
  };

  return (
    <Avatar
      src={resolveImage()}
      onClick={onClick}
      sx={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};

export default FactionAvatar;
