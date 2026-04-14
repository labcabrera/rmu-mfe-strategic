import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  Character,
  fetchCharacter,
  fetchProfession,
  fetchStrategicGame,
  Profession,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: FC = () => {
  const location = useLocation();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [profession, setProfession] = useState<Profession>();
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
  }, [character]);

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((data) => setCharacter(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, characterId, showError]);

  if (!character || !setCharacter || !strategicGame || !profession) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} setCharacter={setCharacter} game={strategicGame} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <CharacterViewResume character={character} setCharacter={setCharacter} />
        </Grid>
        <Grid size={gridSizeMain}>
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
