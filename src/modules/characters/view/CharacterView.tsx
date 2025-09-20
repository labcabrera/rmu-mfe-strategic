import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useError } from '../../../ErrorContext';
import { fetchCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { fetchFaction, Faction } from '../../api/faction';
import { fetchProfession, Profession } from '../../api/professions';
import { fetchStrategicGame, StrategicGame } from '../../api/strategic-games';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);
  const { showError } = useError();

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((char) => {
          setCharacter(char);
        })
        .catch((err: Error) => {
          showError(err.message);
        });
    }
  }, [characterId, showError]);

  useEffect(() => {
    if (character && character.gameId) {
      fetchStrategicGame(character.gameId)
        .then((game) => setStrategicGame(game))
        .catch((err: Error) => {
          showError(err.message);
        });
    }
    if (character && character.factionId) {
      fetchFaction(character.factionId)
        .then((factionData) => setFaction(factionData))
        .catch((err: Error) => {
          showError(err.message);
        });
    }
    if (character && character.info && character.info.professionId) {
      fetchProfession(character.info.professionId)
        .then((professionData) => setProfession(professionData))
        .catch((err: Error) => {
          showError(err.message);
        });
    }
  }, [character, showError]);

  if (!character || !strategicGame || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} setCharacter={setCharacter} faction={faction} game={strategicGame} />
      <CharacterViewTabs
        character={character}
        setCharacter={setCharacter}
        strategicGame={strategicGame}
        faction={faction}
        profession={profession}
      />
    </>
  );
};

export default CharacterView;
