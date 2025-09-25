import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGame, deleteStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import RefreshButton from '../../shared/buttons/RefreshButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const StrategicGameViewActions: FC<{
  strategicGame: StrategicGame;
  setStrategicGame?: Dispatch<SetStateAction<StrategicGame | null>>;
}> = ({ strategicGame, setStrategicGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!strategicGame) return <p>Loading...</p>;

  const handleRefresh = () => {
    fetchStrategicGame(strategicGame.id)
      .then((data) => {
        setStrategicGame(data);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) showError(error.message);
        else showError('Unknown error fetching game');
      });
  };

  const handleDelete = () => {
    deleteStrategicGame(strategicGame.id)
      .then(() => {
        navigate('/strategic/games');
      })
      .catch((error: unknown) => {
        if (error instanceof Error) showError(error.message);
        else showError('Unknown error deleting game');
      });
  };

  const handleEditClick = () => {
    navigate(`/strategic/games/edit/${strategicGame.id}`, { state: { strategicGame } });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDialogDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDelete = () => {
    handleDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="primary" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} underline="hover" color="primary" to="/strategic/games">
              {t('strategic')}
            </Link>
            <Link component={RouterLink} underline="hover" color="primary" to="/strategic/games">
              {t('games')}
            </Link>
            <span>{strategicGame.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <RefreshButton onClick={handleRefresh} />
          <EditButton onClick={handleEditClick} />
          <DeleteButton onClick={handleDeleteClick} />
        </Stack>
      </Stack>
      <DeleteDialog
        message={`Are you sure you want to delete ${strategicGame.name} game? All factions and characters will be eliminated. This action cannot be undone.`}
        onDelete={handleDialogDelete}
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
      />
    </>
  );
};

export default StrategicGameViewActions;
