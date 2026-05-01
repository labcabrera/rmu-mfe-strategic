import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  Faction,
  RmuBreadcrumbs,
  SaveButton,
  StrategicGame,
  updateFaction,
  UpdateFactionDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const FactionUpdateActions: FC<{
  formData: UpdateFactionDto;
  faction: Faction;
  strategicGame: StrategicGame;
}> = ({ formData, faction, strategicGame }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('Faction'), link: `/strategic/factions/view/${faction.id}` },
    { name: t('Edit') },
  ];

  if (!faction || !strategicGame) return <p>Loading...</p>;

  const handleFactionUpdate = async () => {
    updateFaction(faction.id, formData, auth)
      .then((data: Faction) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const handleCancelClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <CancelButton onClick={handleCancelClick} />
      <SaveButton onClick={handleFactionUpdate} />
    </RmuBreadcrumbs>
  );
};

export default FactionUpdateActions;
