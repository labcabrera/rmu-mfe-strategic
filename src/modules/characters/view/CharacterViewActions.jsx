/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { deleteCharacter } from '../../api/characters';

const CharacterViewActions = ({ character }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteCharacter(character.id)
      .then(() => {
        navigate(`/strategic/factions/view/${character.factionId}`);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const handleEditClick = () => {
    navigate(`/strategic/characters/edit/${character.id}`, { state: { character } });
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
            <Link component={RouterLink} underline="hover" color="inherit" to="/strategic/characters">
              Characters
            </Link>
            <span>{character.name}</span>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Faction delete confirmation'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {character.name}? This action cannot be undone
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

export default CharacterViewActions;
