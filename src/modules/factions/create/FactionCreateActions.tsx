import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  CancelButton,
  SaveButton,
  StrategicGame,
  createFaction,
  CreateFactionDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const FactionCreateActions: FC<{
  strategicGame: StrategicGame;
  formData: CreateFactionDto;
  isValid: boolean;
}> = ({ strategicGame, formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('games'), link: '/strategic/games' },
    { name: strategicGame.name, link: `/strategic/games/view/${strategicGame.id}` },
    { name: t('Create faction') },
  ];

  const onCreate = () => {
    createFaction(formData)
      .then((data: { id: string }) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((err) => showError(err.message));
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <CancelButton onClick={() => navigate(-1)} />
      <SaveButton onClick={onCreate} disabled={!isValid} />
    </RmuBreadcrumbs>
  );
};

export default FactionCreateActions;
