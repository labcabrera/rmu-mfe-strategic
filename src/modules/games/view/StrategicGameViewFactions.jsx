/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import StrategicGameViewFactionItem from './StrategicGameViewFactionItem';

const StrategicGameViewFactions = ({ strategicGame, factions, setFactions }) => {
  const navigate = useNavigate();

  const handleCreateFaction = () => {
    navigate(`/strategic/factions/create?gameId=${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  return (
    <>
      <Typography variant="h6" color="secondary">
        Factions
      </Typography>
      <List>
        {factions?.map((item) => (
          <StrategicGameViewFactionItem
            key={item.id}
            faction={item}
            strategicGameId={strategicGame.id}
            factions={factions}
            setFactions={setFactions}
          />
        ))}
      </List>
      <IconButton variant="outlined" onClick={handleCreateFaction}>
        <AddCircleIcon />
      </IconButton>
    </>
  );
};

export default StrategicGameViewFactions;
