/* eslint-disable react/prop-types */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

const StrategicGameUpdateActions = ({ formData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const strategicGame = location.state?.strategicGame;
  const [displayError, setDisplayError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const updateGame = async (e) => {
    const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games/${strategicGame.id}`;
    try {
      e.preventDefault();
      const requestOptions = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };
      const response = await fetch(url, requestOptions);
      if (response.status != 200) {
        throw new Error(`Error updating strategic game: ${response.statusText}`);
      }
      fetch(url, requestOptions)
        .then((response) => response.json())
        .then((data) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }));
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error updating strategic game from ${url}. ${error.message}`);
    }
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleCancelClick = (e) => {
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
            <Link underline="hover" color="inherit" href="/strategic">
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
