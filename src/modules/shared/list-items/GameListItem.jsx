/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import GameAvatar from '../avatars/StrategicGameAvatar';

const GameListItem = ({ game }) => {
  const navigate = useNavigate();

  const handleGameClick = () => {
    navigate(`/strategic/games/view/${game.id}`, { state: { game: game } });
  };

  return (
    <ListItemButton onClick={handleGameClick}>
      <ListItemAvatar sx={{ mr: 2 }}>
        <GameAvatar game={game} />
      </ListItemAvatar>
      <ListItemText primary={game.name} secondary={game.description} />
    </ListItemButton>
  );
};

export default GameListItem;
