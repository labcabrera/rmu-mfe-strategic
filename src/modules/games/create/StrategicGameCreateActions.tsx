import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createStrategicGame } from '../../api/strategic-game';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';
import RmuBreadcrumbs from '../../shared/breadcrumbs/RmuBreadcrumbs';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const StrategicGameCreateActions: React.FC<{
  formData: CreateStrategicGameDto;
  isValid: boolean;
}> = ({ formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('games'), link: '/strategic/games' },
    { name: t('create') },
  ];

  const createGame = () => {
    createStrategicGame(formData)
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
