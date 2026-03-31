import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RmuBreadcrumbs, CancelButton, SaveButton } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createStrategicGame } from '../../api/strategic-game';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';

const StrategicGameCreateActions: React.FC<{
  formData: CreateStrategicGameDto;
  isValid: boolean;
}> = ({ formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('Strategic'), link: '/strategic' },
    { name: t('Games'), link: '/strategic/games' },
    { name: t('Create') },
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
