import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';

import StrategicGameListItem from './StrategicGameListItem';
import StrategicGameListActions from './StrategicGameListActions';

const StrategicGameList = () => {
  const [strategicGames, setStrategicGames] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getStrategicGames = async () => {
    const url = `${process.env.RMU_API_STRATEGIC_URL}/strategic-games`;
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.status != 200) {
        throw new Error(`Strategic fetch error response: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('fetch data:', data);
      setStrategicGames(data.content);
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error loading strategic games from ${url}. ${error.message}`);
    }
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  useEffect(() => {
    getStrategicGames();
  }, []);

  return (
    <>
      <StrategicGameListActions />
        <List>
          {strategicGames?.map((item) => (
            <StrategicGameListItem key={item.id} strategicGame={item} />
          ))}
        </List>
      <Snackbar open={displayError} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} onClose={handleSnackbarClose} message={errorMessage} action={
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
