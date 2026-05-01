import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  Character,
  Faction,
  fetchCharacter,
  fetchFaction,
  fetchProfession,
  fetchRace,
  fetchStrategicGame,
  Profession,
  Race,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character>();
  const [faction, setFaction] = useState<Faction>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [race, setRace] = useState<Race>();
  const [profession, setProfession] = useState<Profession>();
  const { showError } = useError();

  useEffect(() => {
    if (character) {
      fetchStrategicGame(character.gameId, auth)
        .then((response) => setStrategicGame(response))
        .catch((err) => showError(err.message));
      fetchProfession(character.info.professionId, auth)
        .then((response) => setProfession(response))
        .catch((err) => showError(err.message));
      fetchFaction(character.faction.id, auth)
        .then((response) => setFaction(response))
        .catch((err) => showError(err.message));
      fetchRace(character.info.race.id, auth)
        .then((response) => setRace(response))
        .catch((err) => showError(err.message));
    }
  }, [character]);

  useEffect(() => {
    if (!characterId) return;
    fetchCharacter(characterId, auth)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  }, [location.state, characterId, showError]);

  if (!character || !setCharacter || !strategicGame || !profession) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <CharacterViewResume
            character={character}
            race={race}
            profession={profession}
            strategicGame={strategicGame}
            faction={faction}
            setCharacter={setCharacter}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <CharacterViewActions character={character} setCharacter={setCharacter} game={strategicGame} />
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
