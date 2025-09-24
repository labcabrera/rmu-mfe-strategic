import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
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
  const character = location.state?.character as Character;
  const [faction, setFaction] = useState<Faction | null>(null);
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<UpdateCharacterDto>({
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

  const bindFaction = (factionId: string) => {
    fetchFaction(factionId).then((faction: Faction) => setFaction(faction));
  };

  const bindGame = (gameId: string) => {
    fetchStrategicGame(gameId).then((game: StrategicGame) => setGame(game));
  };

  useEffect(() => {
    if (character) {
      bindFaction(character.factionId);
      bindGame(character.gameId);
    }
  }, [character]);

  if (!character || !game || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterUpdateActions character={character} formData={formData} game={game} faction={faction} />
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
