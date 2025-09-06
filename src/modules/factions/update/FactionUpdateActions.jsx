/* eslint-disable react/prop-types */
import React from 'react';
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
import { updateFaction } from '../../api/factions';

const FactionUpdateActions = ({ formData, faction, game }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [displayError, setDisplayError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleFactionUpdate = async () => {
    updateFaction(faction.id, formData)
      .then((data) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error updating faction: ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleCancelClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
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
            <span>Edit</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton variant="outlined" onClick={handleCancelClick}>
            <CancelIcon />
          </IconButton>
          <IconButton variant="outlined" onClick={handleFactionUpdate}>
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

export default FactionUpdateActions;
