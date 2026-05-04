import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CancelButton,
  EditableAvatar,
  fetchStrategicGame,
  LayoutBase,
  SaveButton,
  StrategicGame,
  updateStrategicGame,
  UpdateStrategicGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import StrategicGameForm from '../form/StrategicGameForm';

const StrategicGameUpdate: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<StrategicGame>({} as StrategicGame);
  const [isValid, setIsValid] = useState(false);

  const validateForm = (data: UpdateStrategicGameDto) => {
    if (!data.name || data.name.trim() === '') return false;
    return true;
  };

  const onUpdate = () => {
    updateStrategicGame(strategicGame!.id, formData, auth)
      .then((data: StrategicGame) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/strategic/games/view/${strategicGame!.id}`, { state: { strategicGame } });
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      const { id, owner, ...rest } = strategicGame;
      setFormData(rest as StrategicGame);
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state && location.state.strategicGame) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      fetchStrategicGame(gameId, auth)
        .then((response) => setStrategicGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId, showError]);

  if (!strategicGame || !formData.realmId) return <div>Loading...</div>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-game'), link: `/strategic/games/view/${strategicGame.id}` },
        { name: t('edit') },
      ]}
      actions={[<CancelButton onClick={() => onCancel()} />, <SaveButton onClick={() => onUpdate()} />]}
      leftPanel={
        <EditableAvatar
          imageUrl={formData.imageUrl || ''}
          onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl: imageUrl })}
          images={[]}
        />
      }
    >
      <StrategicGameForm formData={formData} setFormData={setFormData} />
    </LayoutBase>
  );
};

export default StrategicGameUpdate;
