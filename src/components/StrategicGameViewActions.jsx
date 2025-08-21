import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

import { RMU_API_STRATEGIC_URL } from '../constants/environment';

const StrategicGameViewActions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const strategicGame = location.state?.strategicGame;

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const deleteStrategicGame = async () => {
    const url = `${RMU_API_STRATEGIC_URL}/strategic-games/${strategicGame.id}`;
    const response = await fetch(url, { method: 'DELETE' });
    const deleteResponse = await response;
    if (deleteResponse.status == 204) {
      navigate('/strategic');
    } else {
      //TODO display error
      console.log('delete data: ' + data);
    }
  };

  const handleEditClick = () => {
    navigate(`/strategic/edit/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDialogDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDialogDelete = () => {
    deleteStrategicGame();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">Home</Link>
            <Link underline="hover" color="inherit" href="/strategic">Strategic</Link>
            <span>Game</span>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Strategic game delete confirmation'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove '{strategicGame.name}'? This action cannot be undone
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
