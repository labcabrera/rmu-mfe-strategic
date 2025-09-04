/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';

const FactionAvatar = ({ faction, size = 70 }) => {
  const defaultImage = '/static/images/avatars/generic-faction-01.png';

  //TODO add as entity attribute
  const resolveImage = () => {
    if (!faction || !faction.name) {
      return defaultImage;
    }
    // const check = faction.name.toLowerCase();
    // if (check.includes('mordor')) return defaultImage;
    // if (check.includes('gondor')) return '/static/images/races/lotr-gondor.jpg';
    // if (check.includes('moria')) return '/static/images/races/lotr-troll.jpg';
    // if (check.includes('elf')) return '/static/images/races/lotr-elf.jpg';
    return defaultImage;
  };

  return <Avatar src={resolveImage()} sx={{ width: size, height: size }}></Avatar>;
};

export default FactionAvatar;
