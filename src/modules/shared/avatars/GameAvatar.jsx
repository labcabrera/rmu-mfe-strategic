/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';

const GameAvatar = ({ game, size = 70 }) => {
  const defaultImage = '/static/images/avatars/sauron.png';

  //TODO add as entity attribute
  const resolveImage = (game) => {
    return defaultImage;
  };

  return <Avatar src={resolveImage(game)} sx={{ width: size, height: size }}></Avatar>;
};

export default GameAvatar;
