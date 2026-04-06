import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RmuBreadcrumbs,
  RefreshButton,
  EditButton,
  DeleteButton,
  DeleteDialog,
  StrategicGame,
  fetchStrategicGame,
  deleteStrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const StrategicGameViewActions: FC<{
  strategicGame: StrategicGame;
  setStrategicGame: Dispatch<SetStateAction<StrategicGame>>;
}> = ({ strategicGame, setStrategicGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const breadcrumbs = [
    { name: t('strategic'), link: '/strategic' },
    { name: t('games'), link: '/strategic/games' },
  ];

  if (!strategicGame) return <p>Loading...</p>;

  const onRefresh = () => {
    fetchStrategicGame(strategicGame.id)
      .then((data) => setStrategicGame(data))
      .catch((err: Error) => showError(err.message));
  };

  const onEdit = () => {
    navigate(`/strategic/games/edit/${strategicGame.id}`, { state: { strategicGame } });
  };

  const onDelete = () => {
    deleteStrategicGame(strategicGame.id)
      .then(() => navigate('/strategic/games'))
      .catch((err) => showError(err.message));
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <RmuBreadcrumbs items={breadcrumbs}>
        <RefreshButton onClick={onRefresh} />
        <EditButton onClick={onEdit} />
        <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
      </RmuBreadcrumbs>
      <DeleteDialog
        message={`Are you sure you want to delete ${strategicGame.name} game? All factions and characters will be eliminated. This action cannot be undone.`}
        onDelete={onDelete}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default StrategicGameViewActions;
