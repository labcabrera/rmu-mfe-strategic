import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCharacter } from '../../api/characters';
import { fetchFaction } from '../../api/factions';
import { fetchProfession } from '../../api/professions';
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
  const [profession, setProfession] = useState(null);
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
    if (character && character.info && character.info.professionId) {
      console.log('Fetching profession for ID:', character.info.professionId);
      fetchProfession(character.info.professionId)
        .then((professionData) => setProfession(professionData))
        .catch((err) => {
          setErrorMessage(`Error fetching profession: ${err.message}`);
          setDisplayError(true);
        });
    }
  }, [character]);

  if (!character || !strategicGame || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} />
      <CharacterViewAttributes
        character={character}
        setCharacter={setCharacter}
        faction={faction}
        profession={profession}
        strategicGame={strategicGame}
      />
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
      <pre>Character: {JSON.stringify(character, null, 2)}</pre>
      <pre>Profession: {JSON.stringify(profession, null, 2)}</pre>
      <pre>Faction: {JSON.stringify(faction, null, 2)}</pre>
    </>
  );
};

export default CharacterView;
