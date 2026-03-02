import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createFaction } from '../../api/faction';
import { CreateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import RmuBreadcrumbs from '../../shared/breadcrumbs/RmuBreadcrumbs';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

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
    { name: t('factions'), link: `/strategic/games/view/${strategicGame.id}/factions` },
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
