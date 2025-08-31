/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';
import defaultImage from '../../../assets/witch-king.jpg';

const FactionAvatar = ({ faction }) => {
  const resolveImage = () => {
    if (!faction || !faction.name) return defaultImage;
    const check = faction.name.toLowerCase();
    if (check.includes('mordor')) return defaultImage;
    if (check.includes('gondor')) return '/static/images/races/lotr-gondor.jpg';
    if (check.includes('moria')) return '/static/images/races/lotr-troll.jpg';
    return defaultImage;
  };

  return <Avatar src={resolveImage()}></Avatar>;
};

export default FactionAvatar;
