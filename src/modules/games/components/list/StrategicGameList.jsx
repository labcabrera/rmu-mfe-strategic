import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';

import { fetchStrategicGames } from '../../../api/strategic-games';
import StrategicGameListItem from './StrategicGameListItem';
import StrategicGameListActions from './StrategicGameListActions';

const StrategicGameList = () => {
  const [strategicGames, setStrategicGames] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindStrategicGames = async () => {
    try {
      const games = await fetchStrategicGames(0, 10);
      setStrategicGames(games);
    } catch (error) {
      setStrategicGames([]);
      setDisplayError(true);
      setErrorMessage(`Error loading strategic games. ${error.message}`);
    }
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  useEffect(() => {
    bindStrategicGames();
  }, []);

  return (
    <>
      <StrategicGameListActions />
      <List>
        {strategicGames?.map((item) => (
          <StrategicGameListItem key={item.id} strategicGame={item} />
        ))}
      </List>
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

export default StrategicGameList;
