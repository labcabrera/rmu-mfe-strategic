/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import witchKing from '../../../assets/witch-king.jpg';

const StrategicGameViewFactionItem = ({ faction }) => {
  const navigate = useNavigate();

  const handleFactionClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
  };

  return (
    <>
      <ListItemButton onClick={handleFactionClick}>
        <ListItemAvatar>
          <Avatar src={witchKing}></Avatar>
        </ListItemAvatar>
        <ListItemText primary={faction.name} secondary={faction.description} />
      </ListItemButton>
    </>
  );
};

export default StrategicGameViewFactionItem;
