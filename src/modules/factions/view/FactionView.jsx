import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/character';
import { fetchFaction } from '../../api/faction';
import { fetchStrategicGame } from '../../api/strategic-games';
import FactionViewActions from './FactionViewActions';
import FactionViewAttributes from './FactionViewAttributes';
import FactionViewCharacters from './FactionViewCharacters';

const FactionView = () => {
  const location = useLocation();
  const { factionId } = useParams();
  const [faction, setFaction] = useState(location.state?.faction || null);
  const [game, setGame] = useState(null);
  const [characters, setCharacters] = useState([]);
  const { showError } = useError();

  const bindFaction = (factionId) => {
    fetchFaction(factionId)
      .then((data) => {
        setFaction(data);
      })
      .catch((error) => {
        showError(error.message);
      });
  };

  const bindGame = (gameId) => {
    fetchStrategicGame(gameId)
      .then((data) => {
        setGame(data);
      })
      .catch((error) => {
        showError(error.message);
      });
  };

  const bindCharacters = (factionId) => {
    fetchCharacters(`factionId==${factionId}`, 0, 100)
      .then((data) => setCharacters(data))
      .catch((error) => {
        showError(error.message);
      });
  };

  useEffect(() => {
    if (faction && faction.id) {
      bindCharacters(faction.id);
      bindGame(faction.gameId);
    }
  }, [faction]);

  useEffect(() => {
    if (!faction && factionId) {
      bindFaction(factionId);
    }
  }, [faction, factionId]);

  if (!faction || !game) return <div>Loading...</div>;

  return (
    <>
      <FactionViewActions faction={faction} game={game} />
      <Grid container spacing={2}>
        <Grid size={6}>
          <FactionViewAttributes faction={faction} setFaction={setFaction} strategicGame={game} />
        </Grid>
        <Grid size={6}>
          <FactionViewCharacters faction={faction} characters={characters} />
        </Grid>
      </Grid>
    </>
  );
};

export default FactionView;
