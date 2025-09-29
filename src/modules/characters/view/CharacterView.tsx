import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { fetchFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchProfession, Profession } from '../../api/professions';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: FC = () => {
  const location = useLocation();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);
  const { showError } = useError();

  useEffect(() => {
    if (character) {
      fetchStrategicGame(character.gameId)
        .then((game) => setStrategicGame(game))
        .catch((err) => showError(err.message));
      fetchFaction(character.factionId)
        .then((factionData) => setFaction(factionData))
        .catch((err) => showError(err.message));
      fetchProfession(character.info.professionId)
        .then((professionData) => setProfession(professionData))
        .catch((err) => showError(err.message));
    }
  }, [character, showError]);

  useEffect(() => {
    if (location.state?.character) {
      setCharacter(location.state.character);
    } else if (characterId) {
      fetchCharacter(characterId)
        .then((data) => setCharacter(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, characterId, showError]);

  if (!character || !strategicGame || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} setCharacter={setCharacter} faction={faction} game={strategicGame} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <CharacterViewResume
            character={character}
            setCharacter={setCharacter}
            strategicGame={strategicGame}
            faction={faction}
          />
        </Grid>
        <Grid size={10}>
          <CharacterViewTabs
            character={character}
            setCharacter={setCharacter}
            strategicGame={strategicGame}
            faction={faction}
            profession={profession}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterView;
