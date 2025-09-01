/* eslint-disable react/prop-types */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { updateStrategicGame } from '../../api/strategic-games';

const StrategicGameUpdateActions = ({ formData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const strategicGame = location.state?.strategicGame;
  const [displayError, setDisplayError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const updateGame = async () => {
    updateStrategicGame(strategicGame.id, formData)
      .then((data) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error updating strategic game: ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleCancelClick = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link component={RouterLink} color="inherit" to="/strategic">
              Strategic
            </Link>
            <span>Games</span>
            <span>{strategicGame.name}</span>
            <span>Edit</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton variant="outlined" onClick={handleCancelClick}>
            <CancelIcon />
          </IconButton>
          <IconButton variant="outlined" onClick={updateGame}>
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

export default StrategicGameUpdateActions;
