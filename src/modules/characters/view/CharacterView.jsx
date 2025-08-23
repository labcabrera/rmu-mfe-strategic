import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCharacter } from '../../api/characters';
import { fetchFaction } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewAttributes from './CharacterViewAttributes';

const CharacterView = () => {
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [strategicGame, setStrategicGame] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [faction, setFaction] = useState(null);

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
    if (character && character.factionId) {
      fetchFaction(character.factionId)
        .then((factionData) => setFaction(factionData))
        .catch((err) => {
          setErrorMessage(`Error fetching faction: ${err.message}`);
          setDisplayError(true);
        });
    }
  }, [character]);

  if (!character || !strategicGame || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} />
      <CharacterViewAttributes character={character} setCharacter={setCharacter} faction={faction} />
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
      <pre>{JSON.stringify(character, null, 2)}</pre>
    </>
  );
};

export default CharacterView;
