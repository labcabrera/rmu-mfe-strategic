import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateFaction } from '../../api/faction';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import RmuBreadcrumbs from '../../shared/breadcrumbs/RmuBreadcrumbs';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

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
