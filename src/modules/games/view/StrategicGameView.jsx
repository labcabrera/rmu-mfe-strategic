import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { fetchFactions } from '../../api/factions';
import { fetchRealm } from '../../api/realms';
import { fetchStrategicGame } from '../../api/strategic-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';

const StrategicGameView = () => {
  const location = useLocation();
  const params = useParams();
  const [strategicGame, setStrategicGame] = useState(location.state?.strategicGame || null);
  const [factions, setFactions] = useState([]);
  const [realm, setRealm] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindStrategicGame = (gameId) => {
    fetchStrategicGame(gameId)
      .then((data) => {
        setStrategicGame(data);
      })
      .catch((err) => {
        setDisplayError(true);
        setErrorMessage('Error binding game ' + err.message);
      });
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

  const getRealmName = async (realmId) => {
    fetchRealm(realmId)
      .then((data) => {
        setRealm(data);
      })
      .catch((err) => {
        setDisplayError(true);
        setErrorMessage('Error binding realm ' + err.message);
      });
  };

  useEffect(() => {
    if (strategicGame) {
      bindFactions(strategicGame.id);
      getRealmName(strategicGame.realm);
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state?.strategicGame) {
      setStrategicGame(location.state.strategicGame);
    }
    if (params.gameId) {
      bindStrategicGame(params.gameId);
    }
  }, [location.state, params.gameId]);

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
