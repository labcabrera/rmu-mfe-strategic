import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewFactions from './StrategicGameViewFactions';

const StrategicGameView = () => {
  const location = useLocation();
  const strategicGame = location.state?.strategicGame;
  const [realmName, setRealmName] = useState(strategicGame.realm);

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
    getRealmName();
  }, []);

  return (
    <>
      <StrategicGameViewActions />
      <Grid container spacing={2}>
        <Grid size={4}>
          <TextField label="Name" name="name" value={strategicGame.name} readonly fullWidth />
        </Grid>
        <Grid size={4}>
          <TextField label="Realm" name="realm" value={realmName} readonly fullWidth/>
        </Grid>
        <Grid size={4}>
          <TextField label="Status" name="status" value={strategicGame.status} readonly fullWidth/>
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
