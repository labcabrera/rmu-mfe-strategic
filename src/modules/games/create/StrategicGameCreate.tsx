import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  createStrategicGame,
  CreateStrategicGameDto,
  EditableAvatar,
  fetchRealms,
  LayoutBase,
  Realm,
  SaveButton,
  StrategicGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { DEFAULT_REALM_IMAGE, getAvatarImages } from '../../services/image-service';
import StrategicGameForm from '../form/StrategicGameForm';

const EMPTY_STRATEGIC_GAME = {
  name: '',
  realmId: '',
  options: {
    experienceMultiplier: 1,
    fatigueMultiplier: 1,
    boardScaleMultiplier: 1,
    letality: 0,
  },
  powerLevel: {
    baseDevPoints: 60,
    statRandomMin: 11,
    statBoostPotential: 78,
    statBoostTemporary: 56,
    statCreationBoost: 2,
    statCreationSwap: 2,
  },
  description: '',
  imageUrl: `${imageBaseUrl}images/generic/strategic.png`,
} as StrategicGame;

const StrategicGameCreate: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [formData, setFormData] = useState<StrategicGame>(EMPTY_STRATEGIC_GAME);
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateForm = (formData: CreateStrategicGameDto) => {
    return !!formData.name && !!formData.realmId;
  };

  const onCreate = () => {
    createStrategicGame(formData, auth)
      .then((data) => navigate('/strategic/games/view/' + data.id, { state: { strategicGame: data } }))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    setIsValid(validateForm(formData));
  }, [formData]);

  useEffect(() => {
    fetchRealms('', 0, 100, auth)
      .then((data) => setRealms(data.content))
      .catch((err) => showError(err.message));
  }, []);

  if (!realms) return <div>Loading...</div>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: t('create') },
      ]}
      actions={[
        <CancelButton onClick={() => navigate('/strategic/games')} />,
        <SaveButton onClick={() => onCreate()} disabled={!isValid} />,
      ]}
      leftPanel={
        <EditableAvatar
          imageUrl={formData.imageUrl || DEFAULT_REALM_IMAGE}
          onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          images={getAvatarImages()}
        />
      }
    >
      <StrategicGameForm formData={formData} setFormData={setFormData} realms={realms} />
      <TechnicalInfo>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </TechnicalInfo>
    </LayoutBase>
  );
};

export default StrategicGameCreate;
