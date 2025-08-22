/* eslint-disable react/prop-types */

import React from 'react';
import { useNavigate } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import witchKing from '../../../../assets/witch-king.jpg';

const StrategicGameListItem = ({ strategicGame }) => {
  const navigate = useNavigate();

  const handleGameClick = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  return (
    <ListItemButton onClick={handleGameClick}>
      <ListItemAvatar>
        <Avatar src={witchKing}></Avatar>
      </ListItemAvatar>
      <ListItemText primary={strategicGame.name} secondary={strategicGame.user} />
    </ListItemButton>
  );
};

export default StrategicGameListItem;
