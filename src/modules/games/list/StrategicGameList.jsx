import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import { fetchStrategicGames } from '../../api/strategic-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import GameListItem from '../../shared/list-items/GameListItem';
import StrategicGameListActions from './StrategicGameListActions';

const StrategicGameList = () => {
  const [strategicGames, setStrategicGames] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindStrategicGames = () => {
    fetchStrategicGames('', 0, 20)
      .then((response) => {
        setStrategicGames(response);
      })
      .catch((error) => {
        console.error(error);
        setStrategicGames([]);
        setDisplayError(true);
        setErrorMessage(`Error loading strategic games. ${error.message}`);
      });
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
          <GameListItem key={item.id} game={item} />
        ))}
      </List>
      <SnackbarError open={displayError} onClose={handleSnackbarClose} message={errorMessage} />
    </>
  );
};

export default StrategicGameList;
