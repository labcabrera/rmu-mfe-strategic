import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {
  CancelButton,
  Character,
  EditableAvatar,
  Faction,
  fetchCharacter,
  fetchFaction,
  fetchStrategicGame,
  LayoutBase,
  SaveButton,
  StrategicGame,
  TechnicalInfo,
  updateCharacter,
  UpdateCharacterDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { getAvatarImages } from '../../services/image-service';
import CharacterUpdateAttributes from './CharacterUpdateAttributes';

export default function CharacterUpdate() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useError();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>();
  const [faction, setFaction] = useState<Faction>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<UpdateCharacterDto>();

  const onUpdate = () => {
    updateCharacter(character!.id, formData as Partial<Character>, auth)
      .then((data: Character) => navigate(`/strategic/characters/view/${data.id}`, { state: { character: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/strategic/characters/view/${character!.id}`, { state: { character: character } });
  };

  const onImageChange = (imageUrl: string) => {
    setFormData({ ...formData, imageUrl } as UpdateCharacterDto);
  };

  useEffect(() => {
    if (!character) return;
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

  // if (!character || !strategicGame || !faction || !formData) return <div>Loading...</div>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: t('strategic-game'), link: `/strategic/games/view/${strategicGame?.id}` },
        { name: t('faction'), link: `/strategic/factions/view/${faction?.id}` },
        { name: t('character-edit') },
      ]}
      actions={[<CancelButton onClick={onCancel} />, <SaveButton onClick={onUpdate} />]}
      leftPanel={
        <EditableAvatar
          imageUrl={character?.imageUrl || ''}
          onImageChange={onImageChange}
          images={getAvatarImages()}
          variant="rounded"
        />
      }
    >
      {!formData ? (
        <CircularProgress />
      ) : (
        <>
          <CharacterUpdateAttributes formData={formData} setFormData={setFormData} />
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </>
      )}
    </LayoutBase>
  );
}
