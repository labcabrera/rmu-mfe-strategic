import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { CancelButton, RmuBreadcrumbs, SaveButton } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateFaction } from '../../api/faction';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';

const FactionUpdateActions: FC<{
  formData: UpdateFactionDto;
  faction: Faction;
  strategicGame: StrategicGame;
}> = ({ formData, faction, strategicGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('Faction'), link: `/strategic/factions/view/${faction.id}` },
    { name: t('Edit') },
  ];

  if (!faction || !strategicGame) return <p>Loading...</p>;

  const handleFactionUpdate = async () => {
    updateFaction(faction.id, formData)
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
