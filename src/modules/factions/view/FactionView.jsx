import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import { fetchFaction, addFactionXP, addFactionGold } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import FactionViewActions from './FactionViewActions';

const FactionView = () => {
  const location = useLocation();
  const { factionId } = useParams();
  const [faction, setFaction] = useState(location.state?.faction || null);
  const [gameName, setGameName] = useState(null);

  const bindFaction = async (faction) => {
    setFaction(await fetchFaction(factionId));
    const strategicGame = await fetchStrategicGame(faction.gameId);
    setGameName(strategicGame.name);
  };

  const handleAddXP = async (amount) => {
    if (faction) {
      const updatedFaction = await addFactionXP(faction.id, amount);
      setFaction(updatedFaction);
    }
  };

  const handleAddGold = async (amount) => {
    if (faction) {
      const updatedFaction = await addFactionGold(faction.id, amount);
      setFaction(updatedFaction);
    }
  };

  useEffect(() => {
    if (!faction && factionId) {
      bindFaction(faction);
    }
  }, [faction, factionId]);

  if (!faction) return <div>Loading...</div>;

  return (
    <>
      <FactionViewActions faction={faction} />
      <Grid container spacing={2}>
        <Grid size={4}>
          <TextField label="Game" name="game" value={gameName} readonly fullWidth />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={4}>
          <TextField label="Name" name="name" value={faction.name} readonly fullWidth />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={4}>
          <TextField label="Available XP" name="availableXp" value={faction.factionManagement.availableXP} readonly fullWidth />
        </Grid>
        <Grid size={1}>
          <Button
            variant="outlined"
            onClick={() => {
              handleAddXP(10000);
            }}
          >
            +10K
          </Button>
        </Grid>
        <Grid size={7}></Grid>
        <Grid size={4}>
          <TextField label="Available Gold" name="availableGold" value={faction.factionManagement.availableGold} readonly fullWidth />
        </Grid>
        <Grid size={1}>
          <Button
            variant="outlined"
            onClick={() => {
              handleAddGold(1);
            }}
          >
            +1G
          </Button>
        </Grid>
        <Grid size={7}></Grid>
        <Grid size={12}>
          <TextField label="Description" name="description" value={faction.description} readonly fullWidth multiline maxRows={4} />
        </Grid>
      </Grid>
      <pre>{JSON.stringify(faction, null, 2)}</pre>
    </>
  );
};

export default FactionView;
