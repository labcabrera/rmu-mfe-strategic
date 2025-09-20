/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { updateCharacter } from '../../api/character';

const CharacterUpdateActions = ({ character, game, faction, formData }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdate = () => {
    updateCharacter(character.id, formData)
      .then((data) => navigate(`/strategic/characters/view/${data.id}`, { state: { character: data } }))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error updating character: ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleCancel = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character: character } });
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
            <Link component={RouterLink} underline="hover" color="inherit" to="/strategic/games">
              {t('games')}
            </Link>
            <Link component={RouterLink} underline="hover" color="inherit" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
            <span>{faction.name}</span>
            <span>{character.name}</span>
            <span>{t('edit')}</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton variant="outlined" onClick={handleCancel}>
            <CancelIcon />
          </IconButton>
          <IconButton variant="outlined" onClick={handleUpdate}>
            <SaveIcon />
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
    </>
  );
};

export default CharacterUpdateActions;
