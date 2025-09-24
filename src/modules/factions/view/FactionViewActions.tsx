import React, { FC, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Breadcrumbs, IconButton, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { deleteFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const FactionViewActions: FC<{
  faction: Faction;
  strategicGame: StrategicGame;
}> = ({ faction, strategicGame }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { showError } = useError();

  const handleDelete = async () => {
    try {
      await deleteFaction(faction.id);
      navigate(`/strategic/games/view/${faction.gameId}`);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleEditClick = () => {
    navigate(`/strategic/factions/edit/${faction.id}`, { state: { faction, game } });
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
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="primary" underline="hover" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
              {t('strategic')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
              {t('games')}
            </Link>
            <Link
              component={RouterLink}
              color="primary"
              underline="hover"
              to={`/strategic/games/view/${strategicGame.id}`}
            >
              {strategicGame.name}
            </Link>
            <span>{faction.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
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
