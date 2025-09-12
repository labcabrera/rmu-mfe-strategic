import React, { FC } from 'react';
import Avatar from '@mui/material/Avatar';

interface CharacterInfo {
  raceId?: string;
}

interface Character {
  info?: CharacterInfo;
}

const CharacterAvatar: FC<{
  character?: Character;
  size?: number;
}> = ({ character, size = 70 }) => {
  const defaultImage = '/static/images/races/unknown.png';

  const resolveImage = (): string => {
    if (!character || !character.info || !character.info.raceId) {
      return defaultImage;
    }
    const check = character.info.raceId.toLowerCase();
    if (check.includes('orc')) return '/static/images/races/generic-orc-01.png';
    if (check.includes('human')) return '/static/images/races/generic-human-01.png';
    if (check.includes('troll')) return '/static/images/races/generic-troll-01.png';
    if (check.includes('dwarf')) return '/static/images/races/generic-dwarf-01.png';
    if (check.includes('elf')) return '/static/images/races/generic-elf-01.png';
    return defaultImage;
  };

  return <Avatar src={resolveImage()} sx={{ width: size, height: size }} />;
};

export default CharacterAvatar;
