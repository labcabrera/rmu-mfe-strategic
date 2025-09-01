/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import FactionAvatar from '../../shared/avatars/FactionAvatar';

const StrategicGameViewFactionItem = ({ faction }) => {
  const navigate = useNavigate();

  const handleFactionClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
  };

  return (
    <>
      <ListItemButton onClick={handleFactionClick}>
        <ListItemAvatar>
          <FactionAvatar faction={faction} />
        </ListItemAvatar>
        <ListItemText primary={faction.name} secondary={faction.description} />
      </ListItemButton>
    </>
  );
};

export default StrategicGameViewFactionItem;
