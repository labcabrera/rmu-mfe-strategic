import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  CancelButton,
  createFaction,
  EditableAvatar,
  Faction,
  fetchStrategicGame,
  LayoutBase,
  SaveButton,
  StrategicGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { getAvatarImages } from '../../services/image-service';
import FactionForm from '../form/FactionForm';

export const EMPTY_FACTION = {
  gameId: '',
  name: '',
  management: {
    availableGold: 100,
    availableXP: 200000,
  },
  shortDescription: '',
  description: '',
  imageUrl: `${imageBaseUrl}images/generic/faction.png`,
} as Faction;

export default function FactionCreate() {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError } = useError();
  const gameId = searchParams.get('gameId');
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<Faction>(EMPTY_FACTION);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(!!formData.name && !!formData.gameId);
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      setFormData({ ...formData, gameId: strategicGame.id });
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state?.strategicGame && !formData.gameId) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      fetchStrategicGame(gameId, auth)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId]);

  const onCreate = () => {
    createFaction(formData, auth)
      .then((data: { id: string }) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((err) => showError(err.message));
  };

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/home' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: t('strategic-game'), link: `/strategic/games/view/${strategicGame.id}` },
        { name: t('create-faction') },
      ]}
      actions={[
        <CancelButton onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)} />,
        <SaveButton onClick={() => onCreate()} disabled={!isValid} />,
      ]}
      leftPanel={
        <EditableAvatar
          imageUrl={formData.imageUrl || `${imageBaseUrl}images/generic/faction.png`}
          onImageChange={(newImageUrl) => setFormData({ ...formData, imageUrl: newImageUrl })}
          images={getAvatarImages()}
        />
      }
    >
      <FactionForm formData={formData} setFormData={setFormData} />
      <TechnicalInfo>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </TechnicalInfo>
    </LayoutBase>
  );
}
