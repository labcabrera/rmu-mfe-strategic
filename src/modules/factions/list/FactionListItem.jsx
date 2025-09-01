/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import FactionAvatar from '../../shared/avatars/FactionAvatar';

const FactionListItem = ({ strategicGame: faction }) => {
  const navigate = useNavigate();

  const handleGameClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
  };

  return (
    <ListItemButton onClick={handleGameClick}>
      <ListItemAvatar>
        <FactionAvatar faction={faction} />
      </ListItemAvatar>
      <ListItemText primary={faction.name} secondary={faction.user} />
    </ListItemButton>
  );
};

export default FactionListItem;
