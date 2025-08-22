/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';

import witchKing from '../../../../assets/witch-king.jpg';

const StrategicGameViewFactionItem = ({ faction, factions, setFactions }) => {
  const navigate = useNavigate();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const deleteFaction = () => {
    const url = `${process.env.RMU_API_STRATEGIC_URL}/factions/${faction.id}`;
    fetch(url, { method: 'DELETE' })
      .then((response) => {
        if (response.status !== 204) throw new Error(`Error: ${response.status} ${response.statusText}`);
        setFactions(factions.filter((item) => item.id !== faction.id));
      })
      .catch((error) => {
        console.log('error deleting faction:', error);
        setDisplayError(true);
        setErrorMessage(`Error creating game from ${url}. ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleGameClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
  };

  return (
    <>
      <ListItemButton onClick={handleGameClick}>
        <ListItemAvatar>
          <Avatar src={witchKing}></Avatar>
        </ListItemAvatar>
        <ListItemText primary={faction.name} secondary={faction.description} />
      </ListItemButton>
      <Button variant="outlined" onClick={() => deleteFaction()}>
        Delete
      </Button>
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

export default StrategicGameViewFactionItem;
