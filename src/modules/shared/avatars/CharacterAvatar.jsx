/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';
import defaultImage from '../../../assets/witch-king.jpg';

const CharacterAvatar = ({ character }) => {
  const resolveImage = () => {
    if (!character || !character.info || !character.info.race) return defaultImage;
    const check = character.info.race.toLowerCase();
    if (check.includes('orc')) return '/static/images/races/lotr-orc-lesser.jpg';
    if (check.includes('human')) return '/static/images/races/lotr-gondor.jpg';
    if (check.includes('troll')) return '/static/images/races/lotr-troll.jpg';
    if (check.includes('elf')) return '/static/images/races/lotr-elf.jpg';
    return defaultImage;
  };

  return <Avatar src={resolveImage()}></Avatar>;
};

export default CharacterAvatar;
