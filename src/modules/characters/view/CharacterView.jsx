import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useError } from '../../../ErrorContext';
import { fetchCharacter } from '../../api/characters';
import { fetchFaction } from '../../api/factions';
import { fetchProfession } from '../../api/professions';
import { fetchStrategicGame } from '../../api/strategic-games';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView = () => {
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const [strategicGame, setStrategicGame] = useState(null);
  const [profession, setProfession] = useState(null);
  const [faction, setFaction] = useState(null);
  const { showError } = useError();

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((char) => {
          setCharacter(char);
        })
        .catch((err) => {
          showError(err.message);
        });
    }
  }, [characterId]);

  useEffect(() => {
    if (character && character.gameId) {
      fetchStrategicGame(character.gameId)
        .then((game) => setStrategicGame(game))
        .catch((err) => {
          showError(err.message);
        });
    }
    if (character && character.factionId) {
      fetchFaction(character.factionId)
        .then((factionData) => setFaction(factionData))
        .catch((err) => {
          showError(err.message);
        });
    }
    if (character && character.info && character.info.professionId) {
      console.log('Fetching profession for ID:', character.info.professionId);
      fetchProfession(character.info.professionId)
        .then((professionData) => setProfession(professionData))
        .catch((err) => {
          showError(err.message);
        });
    }
  }, [character]);

  if (!character || !strategicGame || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} />
      <CharacterViewTabs character={character} setCharacter={setCharacter} strategicGame={strategicGame} faction={faction} profession={profession} />
    </>
  );
};

export default CharacterView;
