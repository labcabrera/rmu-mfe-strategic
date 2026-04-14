import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  CancelButton,
  SaveButton,
  StrategicGame,
  updateStrategicGame,
  UpdateStrategicGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const StrategicGameUpdateActions: FC<{
  strategicGame: StrategicGame;
  formData: UpdateStrategicGameDto;
  isValid: boolean;
}> = ({ strategicGame, formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('Strategic'), link: '/strategic' },
    { name: t('Game'), link: `/strategic/games/view/${strategicGame.id}` },
    { name: t('Edit') },
  ];

  const onUpdateGame = async () => {
    updateStrategicGame(strategicGame.id, formData)
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
