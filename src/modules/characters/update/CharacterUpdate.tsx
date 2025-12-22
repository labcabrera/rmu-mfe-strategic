import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchCharacter } from '../../api/character';
import { Character, UpdateCharacterDto } from '../../api/character.dto';
import { fetchFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import RaceAvatar from '../../shared/avatars/RaceAvatar';
import CharacterUpdateActions from './CharacterUpdateActions';
import CharacterUpdateAttributes from './CharacterUpdateAttributes';
import CharacterUpdateResume from './CharacterUpdateResume';

const CharacterUpdate: React.FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<UpdateCharacterDto | null>(null);

  useEffect(() => {
    if (character) {
      fetchStrategicGame(character.gameId)
        .then((game: StrategicGame) => setStrategicGame(game))
        .catch((err) => showError(err.message));
      fetchFaction(character.factionId)
        .then((faction: Faction) => setFaction(faction))
        .catch((err) => showError(err.message));
      setFormData({
        name: character?.name || '',
        description: character?.description || '',
        info: {
          weight: character?.info?.weight || 0,
          height: character?.info?.height || 0,
        },
        roleplay: {
          gender: character?.roleplay?.gender || '',
          age: character?.roleplay?.age || 0,
        },
      });
    }
  }, [character]);

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
      <CharacterUpdateActions character={character} formData={formData} game={strategicGame} faction={faction} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <RaceAvatar raceName={character.info.raceName} size={300} />
          <CharacterUpdateResume formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={7}>
          <CharacterUpdateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>formData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>character: {JSON.stringify(character, null, 2)}</pre> */}
    </>
  );
};

export default CharacterUpdate;
