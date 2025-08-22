import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

import { fetchCharacter } from '../../api/characters';
import { fetchStrategicGame } from '../../api/strategic-games';
import CharacterViewActions from './CharacterViewActions';

import SnackbarError from '../../shared/errors/SnackbarError';

const CharacterView = () => {
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [strategicGame, setStrategicGame] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((char) => {
          setCharacter(char);
        })
        .catch((err) => {
          setErrorMessage(`Error fetching strategic character: ${err.message}`);
          setDisplayError(true);
        });
    }
  }, [characterId]);

  useEffect(() => {
    if (character && character.gameId) {
      fetchStrategicGame(character.gameId)
        .then((game) => setStrategicGame(game))
        .catch((err) => {
          setErrorMessage(`Error fetching strategic game: ${err.message}`);
          setDisplayError(true);
        });
    }
  }, [character]);

  if (!character || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions faction={character} />
      <Grid container spacing={2}>
        <Grid size={12}>
          <Link component={RouterLink} underline="hover" color="inherit" to={`/strategic/games/view/${strategicGame.id}`}>
            {strategicGame.name}
          </Link>
        </Grid>
        <Grid size={4}>
          <TextField label="Name" name="name" value={character.name} readonly fullWidth />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={4}>
          <TextField label="Available XP" name="availableXp" value={character.name} readonly fullWidth />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={4}>
          <TextField label="Available Gold" name="availableGold" value={character.name} readonly fullWidth />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={12}>
          <TextField label="Description" name="description" value={character.description} readonly fullWidth multiline maxRows={4} />
        </Grid>
      </Grid>

      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
      <pre>{JSON.stringify(character, null, 2)}</pre>
    </>
  );
};

export default CharacterView;
