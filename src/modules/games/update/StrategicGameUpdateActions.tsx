import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  CancelButton,
  SaveButton,
  StrategicGame,
  updateStrategicGame,
  UpdateStrategicGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const StrategicGameUpdateActions: FC<{
  strategicGame: StrategicGame;
  formData: UpdateStrategicGameDto;
  isValid: boolean;
}> = ({ strategicGame, formData, isValid }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('strategic-game'), link: `/strategic/games/view/${strategicGame.id}` },
    { name: t('edit') },
  ];

  const onUpdateGame = async () => {
    updateStrategicGame(strategicGame.id, formData, auth)
      .then((data: StrategicGame) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame } });
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <CancelButton onClick={onCancel} />
      <SaveButton onClick={onUpdateGame} />
    </RmuBreadcrumbs>
  );
};

export default StrategicGameUpdateActions;
