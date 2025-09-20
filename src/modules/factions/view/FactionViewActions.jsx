/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { deleteFaction } from '../../api/faction';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const FactionViewActions = ({ faction, game }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { showError } = useError();

  const handleDelete = () => {
    try {
      deleteFaction(faction.id);
      navigate(`/strategic/games/view/${faction.gameId}`);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleEditClick = () => {
    navigate(`/strategic/factions/edit/${faction.id}`, { state: { faction: faction, game: game } });
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
            <Link color="inherit" href="/">
              Home
            </Link>
            <Link component={RouterLink} color="inherit" to="/strategic/games">
              {t('strategic')}
            </Link>
            <Link component={RouterLink} color="inherit" to="/strategic/games">
              {t('games')}
            </Link>
            <Link component={RouterLink} color="inherit" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
            <span>{faction.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          <IconButton variant="outlined" onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
          <IconButton variant="outlined" onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
      <DeleteDialog
        message={`Are you sure you want to delete ${faction.name} character? All characters in the faction will be eliminated. This action cannot be undone.`}
        onDelete={() => handleDialogDelete()}
        open={deleteDialogOpen}
        onClose={() => handleDialogDeleteClose()}
      />
    </>
  );
};

export default FactionViewActions;
