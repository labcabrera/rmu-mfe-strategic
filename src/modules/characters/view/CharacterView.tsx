import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { fetchProfession, Profession } from '../../api/professions';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: FC = () => {
  const location = useLocation();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const { showError } = useError();

  useEffect(() => {
    if (character) {
      fetchStrategicGame(character.gameId)
        .then((game) => setStrategicGame(game))
        .catch((err) => showError(err.message));
      fetchProfession(character.info.professionId)
        .then((professionData) => setProfession(professionData))
        .catch((err) => showError(err.message));
    }
  }, [character, showError]);

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((data) => setCharacter(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, characterId, showError]);

  if (!character || !setCharacter || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} setCharacter={setCharacter} game={strategicGame} />
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, md: 2 }}>
          <CharacterViewResume character={character} setCharacter={setCharacter} strategicGame={strategicGame} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <CharacterViewTabs
            character={character}
            setCharacter={setCharacter}
            strategicGame={strategicGame}
            profession={profession}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterView;
