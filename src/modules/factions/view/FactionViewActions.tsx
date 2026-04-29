import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  RefreshButton,
  EditButton,
  DeleteButton,
  DeleteDialog,
  deleteFaction,
  Faction,
  fetchFaction,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const FactionViewActions: FC<{
  faction: Faction;
  setFaction: React.Dispatch<React.SetStateAction<Faction | null>>;
  strategicGame: StrategicGame;
}> = ({ faction, setFaction, strategicGame }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { showError } = useError();
  const breadcrumbs = [{ name: t('strategic'), link: '/strategic' }, { name: t('faction') }];

  if (!faction || !strategicGame) return <p>Loading...</p>;

  const handleRefresh = () => {
    fetchFaction(faction.id, auth)
      .then((data) => setFaction(data))
      .catch((error) => showError(error.message));
  };

  const handleDelete = async () => {
    deleteFaction(faction.id, auth)
      .then(() => navigate(`/strategic/games/view/${faction.gameId}`))
      .catch((error) => showError(error.message));
  };

  const handleEditClick = () => {
    navigate(`/strategic/factions/edit/${faction.id}`, { state: { faction, strategicGame } });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDialogDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDelete = async () => {
    await handleDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <RmuBreadcrumbs items={breadcrumbs}>
        <RefreshButton onClick={handleRefresh} />
        <EditButton onClick={handleEditClick} />
        <DeleteButton onClick={handleDeleteClick} />
      </RmuBreadcrumbs>
      <DeleteDialog
        message={`Are you sure you want to delete ${faction.name} character? All characters in the faction will be eliminated. This action cannot be undone.`}
        onDelete={handleDialogDelete}
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
      />
    </>
  );
};

export default FactionViewActions;
