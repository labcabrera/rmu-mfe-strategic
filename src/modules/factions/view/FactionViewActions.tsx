import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchFaction, deleteFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import RmuBreadcrumbs from '../../shared/breadcrumbs/RmuBreadcrumbs';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import RefreshButton from '../../shared/buttons/RefreshButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const FactionViewActions: FC<{
  faction: Faction;
  setFaction: React.Dispatch<React.SetStateAction<Faction | null>>;
  strategicGame: StrategicGame;
}> = ({ faction, setFaction, strategicGame }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { showError } = useError();
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('games'), link: '/strategic/games' },
    { name: strategicGame.name, link: `/strategic/games/view/${strategicGame.id}` },
  ];

  if (!faction || !strategicGame) return <p>Loading...</p>;

  const handleRefresh = () => {
    fetchFaction(faction.id)
      .then((data: Faction) => {
        setFaction(data);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const handleDelete = async () => {
    try {
      await deleteFaction(faction.id);
      navigate(`/strategic/games/view/${faction.gameId}`);
    } catch (err: any) {
      showError(err.message);
    }
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
