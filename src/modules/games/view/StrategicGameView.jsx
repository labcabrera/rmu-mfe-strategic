import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { fetchFactions } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';

const StrategicGameView = () => {
  const location = useLocation();
  const { gameId } = useParams();
  const [strategicGame, setStrategicGame] = useState(location.state?.strategicGame || null);
  const [factions, setFactions] = useState([]);
  const [realm, setRealm] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindStrategicGame = async (gameId) => {
    try {
      const game = await fetchStrategicGame(gameId);
      setStrategicGame(game);
    } catch (err) {
      console.log('Error binding strategic games', err);
    }
  };

  const bindFactions = (gameId) => {
    fetchFactions(`gameId==${gameId}`, 0, 100)
      .then((data) => {
        setFactions(data);
      })
      .catch((err) => {
        setDisplayError(true);
        setErrorMessage('Error binding factions ' + err.message);
      });
  };

  const getRealmName = async () => {
    const url = `${process.env.RMU_API_CORE_URL}/realms/${strategicGame.realm}`;
    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      setRealm(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!strategicGame && gameId) {
      bindStrategicGame();
    } else {
      getRealmName();
    }
  }, [strategicGame, gameId]);

  useEffect(() => {
    if (strategicGame) {
      bindFactions(strategicGame.id);
    }
  }, [strategicGame]);

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameViewActions strategicGame={strategicGame} />
      <Grid container spacing={2}>
        <Grid item size={6}>
          <StrategicGameViewAttributes strategicGame={strategicGame} realm={realm} />
        </Grid>
        <Grid item size={6}>
          <StrategicGameViewFactions strategicGame={strategicGame} factions={factions} setFactions={setFactions} />
        </Grid>
      </Grid>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </>
  );
};

export default StrategicGameView;
