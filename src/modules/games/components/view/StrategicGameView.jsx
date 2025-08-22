import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import { fetchStrategicGame } from '../../../api/strategic-games';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewFactions from './StrategicGameViewFactions';

const StrategicGameView = () => {
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
        <Grid size={12}>
          <TextField label="Description" name="description" value={strategicGame.description} readonly fullWidth multiline maxRows={4} />
        </Grid>
      </Grid>
      <StrategicGameViewFactions strategicGame={strategicGame} />
    </>
  );
};

export default StrategicGameView;
