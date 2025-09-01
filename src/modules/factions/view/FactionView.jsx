import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { fetchCharacters } from '../../api/characters';
import { fetchFaction } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import FactionViewActions from './FactionViewActions';
import FactionViewAttributes from './FactionViewAttributes';
import FactionViewCharacters from './FactionViewCharacters';

const FactionView = () => {
  const location = useLocation();
  const { factionId } = useParams();
  const [faction, setFaction] = useState(location.state?.faction || null);
  const [strategicGame, setStrategicGame] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindFaction = async (faction) => {
    setFaction(await fetchFaction(factionId));
    console.log('fetching game ' + faction.gameId);
    await bindGame();
  };

  const bindGame = async () => {
    console.log('fetching game ' + faction.gameId);
    const strategicGame = await fetchStrategicGame(faction.gameId);
    setStrategicGame(strategicGame);
    console.log('game ok ' + faction.gameId);
  };

  const bindCharacters = () => {
    console.log('Binding characters for faction:', faction.id);
    fetchCharacters(`factionId==${faction.id}`, 0, 100)
      .then((data) => setCharacters(data))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error fetching characters: ${error.message}`);
      });
  };

  useEffect(() => {
    if (faction && faction.id) {
      bindCharacters();
    }
  }, [faction]);

  useEffect(() => {
    if (!faction && factionId) {
      bindFaction(faction);
    } else {
      bindGame();
    }
  }, [faction, factionId]);

  if (!faction || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <FactionViewActions faction={faction} />
      <Grid container spacing={2}>
        <Grid size={6}>
          <FactionViewAttributes faction={faction} setFaction={setFaction} strategicGame={strategicGame} />
        </Grid>
        <Grid size={6}>
          <FactionViewCharacters faction={faction} characters={characters} />
        </Grid>
      </Grid>
      <SnackbarError open={displayError} message={errorMessage} onClose={() => setDisplayError(false)} />
      <pre>{JSON.stringify(faction, null, 2)}</pre>
    </>
  );
};

export default FactionView;
