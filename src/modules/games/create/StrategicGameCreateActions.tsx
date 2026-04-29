import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  CancelButton,
  SaveButton,
  createStrategicGame,
  CreateStrategicGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const StrategicGameCreateActions: React.FC<{
  formData: CreateStrategicGameDto;
  isValid: boolean;
}> = ({ formData, isValid }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('strategic-games'), link: '/strategic/games' },
    { name: t('create') },
  ];

  const createGame = () => {
    createStrategicGame(formData, auth)
      .then((data) => navigate('/strategic/games/view/' + data.id, { state: { strategicGame: data } }))
      .catch((err) => showError(err.message));
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <CancelButton onClick={() => navigate(-1)} />
      <SaveButton onClick={createGame} disabled={!isValid} />
    </RmuBreadcrumbs>
  );
};

export default StrategicGameCreateActions;
