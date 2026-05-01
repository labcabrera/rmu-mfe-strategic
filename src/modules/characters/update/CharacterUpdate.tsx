import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  Character,
  EditableAvatar,
  Faction,
  fetchCharacter,
  fetchFaction,
  fetchStrategicGame,
  StrategicGame,
  TechnicalInfo,
  UpdateCharacterDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { getAvatarImages } from '../../services/image-service';
import CharacterUpdateActions from './CharacterUpdateActions';
import CharacterUpdateAttributes from './CharacterUpdateAttributes';

export default function CharacterUpdate() {
  const auth = useAuth();
  const location = useLocation();
  const { showError } = useError();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>();
  const [faction, setFaction] = useState<Faction>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<UpdateCharacterDto>();

  const onImageChange = (image: string) => {
    setFormData({ ...formData, imageUrl: image! });
  };

  useEffect(() => {
    if (character) {
      fetchStrategicGame(character.gameId, auth)
        .then((game: StrategicGame) => setStrategicGame(game))
        .catch((err) => showError(err.message));
      fetchFaction(character.faction.id, auth)
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
      } as UpdateCharacterDto);
    }
  }, [character]);

  useEffect(() => {
    if (location.state?.character) {
      setCharacter(location.state.character);
    } else if (characterId) {
      fetchCharacter(characterId, auth)
        .then((data) => setCharacter(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, characterId, showError]);

  if (!character || !strategicGame || !faction || !formData) return <div>Loading...</div>;

  return (
    <>
      <CharacterUpdateActions character={character} formData={formData} game={strategicGame} faction={faction} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <EditableAvatar
            imageUrl={character.imageUrl || ''}
            onImageChange={onImageChange}
            images={getAvatarImages()}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <CharacterUpdateAttributes formData={formData} setFormData={setFormData} />
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
}
