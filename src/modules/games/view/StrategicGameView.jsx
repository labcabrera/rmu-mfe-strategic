import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { useError } from '../../../ErrorContext';
import { fetchFactions } from '../../api/faction';
import { fetchRealm } from '../../api/realm';
import { fetchStrategicGame } from '../../api/strategic-game';
import { fetchTacticalGames } from '../../api/tactical-games';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

const StrategicGameView = () => {
  const location = useLocation();
  const params = useParams();
  const [game, setGame] = useState(location.state?.strategicGame || null);
  const [factions, setFactions] = useState([]);
  const [tacticalGames, setTacticalGames] = useState([]);
  const [realm, setRealm] = useState(null);
  const { showError } = useError();

  const bindStrategicGame = (gameId) => {
    fetchStrategicGame(gameId)
      .then((data) => {
        setGame(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const bindTacticalGames = (gameId) => {
    fetchTacticalGames(`strategicGameId==${gameId}`, 0, 100)
      .then((data) => {
        setTacticalGames(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const bindFactions = (gameId) => {
    fetchFactions(`gameId==${gameId}`, 0, 100)
      .then((data) => {
        setFactions(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const getRealmName = async (realmId) => {
    fetchRealm(realmId)
      .then((data) => {
        setRealm(data);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  useEffect(() => {
    if (game) {
      bindFactions(game.id);
      bindTacticalGames(game.id);
      getRealmName(game.realm);
    }
  }, [game]);

  useEffect(() => {
    if (location.state?.strategicGame) {
      setGame(location.state.strategicGame);
    }
    if (params.gameId) {
      bindStrategicGame(params.gameId);
    }
  }, [location.state, params.gameId]);

  if (!game) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameViewActions strategicGame={game} />
      <Grid container spacing={2}>
        <Grid item size={6}>
          <StrategicGameViewAttributes strategicGame={game} realm={realm} />
        </Grid>
        <Grid item size={6}>
          <StrategicGameViewFactions strategicGame={game} factions={factions} setFactions={setFactions} />
        </Grid>
        <Grid item size={6}>
          <StrategicGameViewTacticalGames strategicGame={game} tacticalGames={tacticalGames} />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameView;
