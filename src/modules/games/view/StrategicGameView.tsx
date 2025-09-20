import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { fetchTacticalGames, TacticalGame } from '../../api/tactical-games';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

const StrategicGameView: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ gameId: string }>();
  const [game, setGame] = useState<StrategicGame | null>(location.state?.strategicGame || null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>([]);
  const { showError } = useError();

  const bindStrategicGame = (gameId: string) => {
    fetchStrategicGame(gameId)
      .then((data) => {
        setGame(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  const bindTacticalGames = (gameId: string) => {
    fetchTacticalGames(`strategicGameId==${gameId}`, 0, 100)
      .then((data) => {
        setTacticalGames(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  const bindFactions = (gameId: string) => {
    fetchFactions(`gameId==${gameId}`, 0, 100)
      .then((data) => {
        setFactions(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  useEffect(() => {
    if (game) {
      bindFactions(game.id);
      bindTacticalGames(game.id);
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
        <Grid size={12}>
          <StrategicGameViewAttributes strategicGame={game} />
        </Grid>
        <Grid size={12}>
          <StrategicGameViewFactions strategicGame={game} factions={factions} setFactions={setFactions} />
        </Grid>
        <Grid size={12}>
          <StrategicGameViewTacticalGames strategicGame={game} tacticalGames={tacticalGames} />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameView;
