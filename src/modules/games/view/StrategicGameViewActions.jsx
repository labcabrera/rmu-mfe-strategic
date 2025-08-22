/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';

import { deleteStrategicGame } from '../../api/strategic-games';

const StrategicGameViewActions = ({ strategicGame }) => {
  const navigate = useNavigate();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await deleteStrategicGame(strategicGame.id);
      navigate('/strategic/games');
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error deleting game: ${error.message}`);
    }
    // const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${strategicGame.id}`;
    // fetch(url, { method: 'DELETE' })
    //   .then((response) => {
    //     if (response.status !== 204) throw new Error(`Error: ${response.status} ${response.statusText}`);
    //   })
    //   .then(() => navigate('/strategic/'))
    //   .catch((error) => {
    //     setDisplayError(true);
    //     setErrorMessage(`Error creating game from ${url}. ${error.message}`);
    //   });
  };

  const handleEditClick = () => {
    navigate(`/strategic/games/edit/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
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
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/strategic/games">
              Strategic
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/strategic/games">
              Games
            </Link>
            <span>{strategicGame.name}</span>
            <span>View</span>
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
      <Snackbar
        open={displayError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleSnackbarClose}
        message={errorMessage}
        action={
          <React.Fragment>
            <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Strategic game delete confirmation'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {strategicGame.name}? This action cannot be undone
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogDeleteClose}>Cancel</Button>
          <Button onClick={handleDialogDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StrategicGameViewActions;
