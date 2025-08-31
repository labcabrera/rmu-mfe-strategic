import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { fetchStrategicGame } from '../../api/strategic-games';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewFactions from './StrategicGameViewFactions';

const StrategicGameView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const [strategicGame, setStrategicGame] = useState(location.state?.strategicGame || null);
  const [realmName, setRealmName] = useState(strategicGame?.realm || '');

  const bindStrategicGame = async () => {
    try {
      console.log('Binding strategic game:', gameId);
      const game = await fetchStrategicGame(gameId);
      console.log('Fetched strategic game:', game);
      setStrategicGame(game);
    } catch (err) {
      console.log('Error binding strategic games', err);
    }
  };

  const getRealmName = async () => {
    const url = `${process.env.RMU_API_CORE_URL}/realms/${strategicGame.realm}`;
    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      setRealmName(data.name);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateCharacter = () => {
    navigate(`/strategic/characters/create?gameId=${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  useEffect(() => {
    console.log('StrategicGameView useEffect - gameId:', gameId, ' strategicGame:', strategicGame);
    if (!strategicGame && gameId) {
      bindStrategicGame();
    } else {
      getRealmName();
    }
  }, [strategicGame, gameId]);

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameViewActions strategicGame={strategicGame} />
      <Grid container spacing={2}>
        <Grid size={4}>
          <TextField label="Name" name="name" value={strategicGame.name} readonly fullWidth />
        </Grid>
        <Grid size={4}>
          <TextField label="Realm" name="realm" value={realmName} readonly fullWidth />
        </Grid>
        <Grid size={4}>
          <TextField label="Status" name="status" value={strategicGame.status} readonly fullWidth />
        </Grid>
        {strategicGame && strategicGame.description && (
          <Grid size={12}>
            <TextField label="Description" name="description" value={strategicGame.description} readonly fullWidth multiline maxRows={4} />
          </Grid>
        )}
        <Grid size={12}>Options</Grid>
        <Grid size={4}>
          <TextField label="Experience multiplier" name="experienceMultiplier" value={strategicGame.options.experienceMultiplier} fullWidth />
        </Grid>
        <Grid size={8}></Grid>

        <Grid size={12}>Power level</Grid>
        <Grid size={4}>
          <TextField label="Stat random min" name="statRandomMin" value={strategicGame.powerLevel.statRandomMin} fullWidth />
        </Grid>
        <Grid size={8}></Grid>

        <Grid size={4}>
          <TextField label="Stat Boost Potential" name="statBoostPotential" value={strategicGame.powerLevel.statBoostPotential} fullWidth />
        </Grid>
        <Grid size={4}>
          <TextField label="Stat Boost Temporary" name="statBoostTemporary" value={strategicGame.powerLevel.statBoostTemporary} fullWidth />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <TextField label="Stat Creation Boost" name="statCreationBoost" value={strategicGame.powerLevel.statCreationBoost} fullWidth />
        </Grid>
        <Grid size={4}>
          <TextField label="Stat Creation Swap" name="statCreationSwap" value={strategicGame.powerLevel.statCreationSwap} fullWidth />
        </Grid>
      </Grid>
      <StrategicGameViewFactions strategicGame={strategicGame} />
      <Button variant="outlined" onClick={() => handleCreateCharacter()}>
        Add character
      </Button>
    </>
  );
};

export default StrategicGameView;
