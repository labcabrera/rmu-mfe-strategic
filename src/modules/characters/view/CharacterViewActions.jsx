/* eslint-disable react/prop-types */
import React, { useState } from 'react';
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
import { deleteCharacter } from '../../api/characters';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const CharacterViewActions = ({ character }) => {
  const { t } = useTranslation();
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
              {t('strategic')}
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to="/strategic/characters">
              {t('characters')}
            </Link>
            <span>{character.name}</span>
            <span>{t('view')}</span>
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
        message={`Are you sure you want to delete ${character.name} character? This action cannot be undone.`}
        onDelete={() => handleDialogDelete()}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default CharacterViewActions;
