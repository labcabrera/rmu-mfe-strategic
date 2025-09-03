/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';
import defaultImage from '../../../assets/witch-king.jpg';

const CharacterAvatar = ({ character, size = 70 }) => {
  const resolveImage = () => {
    if (!character || !character.info || !character.info.race) return defaultImage;
    const check = character.info.race.toLowerCase();
    if (check.includes('orc')) return '/static/images/races/generic-orc-01.png';
    if (check.includes('human')) return '/static/images/races/generic-human-01.png';
    if (check.includes('troll')) return '/static/images/races/generic-troll-01.png';
    if (check.includes('dwarf')) return '/static/images/races/generic-dwarf-01.png';
    if (check.includes('elf')) return '/static/images/races/generic-elf-01.png';
    return defaultImage;
  };

  return <Avatar src={resolveImage()} sx={{ width: size, height: size }}></Avatar>;
};

export default CharacterAvatar;
