/* eslint-disable react/prop-types */
import React from 'react';
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
import { deleteStrategicGame } from '../../api/strategic-game';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const StrategicGameViewActions = ({ strategicGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDelete = () => {
    deleteStrategicGame(strategicGame.id)
      .then(() => {
        navigate('/strategic/games');
      })
      .catch((error) => {
        showError(`Error deleting game: ${error.message}`);
      });
  };

  const handleEditClick = () => {
    navigate(`/strategic/games/edit/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
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
              Strategic
            </Link>
            <Link component={RouterLink} color="inherit" to="/strategic/games">
              Games
            </Link>
            <span>{strategicGame.name}</span>
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
        message={`Are you sure you want to delete ${strategicGame.name} game? All factions and characters will be eliminated. This action cannot be undone.`}
        onDelete={() => handleDialogDelete()}
        open={deleteDialogOpen}
        onClose={() => handleDialogDeleteClose()}
      />
    </>
  );
};

export default StrategicGameViewActions;
