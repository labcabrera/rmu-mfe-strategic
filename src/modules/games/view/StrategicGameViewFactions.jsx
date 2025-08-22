/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import Button from '@mui/material/Button';

import StrategicGameViewFactionItem from './StrategicGameViewFactionItem';

const StrategicGameViewFactions = ({ strategicGame }) => {
  const navigate = useNavigate();
  const [factions, setFactions] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createFaction = () => {
    navigate(`/strategic/factions/create?gameId=${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  const fetchFactions = () => {
    const url = `${process.env.RMU_API_STRATEGIC_URL}/factions?q=gameId==${strategicGame.id}`;
    fetch(url, { method: 'GET' })
      .then((response) => {
        if (response.status != 200) throw new Error(`Faction fetch error response: ${response.statusText}`);
        return response.json();
      })
      .then((data) => setFactions(data.content))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error fetching factions from ${url}. ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  useEffect(() => {
    fetchFactions();
  }, []);

  return (
    <>
      Faction view for game ID: {strategicGame.name}
      <List>
        {factions?.map((item) => (
          <StrategicGameViewFactionItem
            key={item.id}
            faction={item}
            strategicGameId={strategicGame.id}
            factions={factions}
            setFactions={setFactions}
          />
        ))}
      </List>
      <Button variant="outlined" onClick={() => createFaction()}>
        Add faction
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

export default StrategicGameViewFactions;
