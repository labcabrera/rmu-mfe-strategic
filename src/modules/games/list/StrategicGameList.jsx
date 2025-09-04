import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGames } from '../../api/strategic-games';
import GameListItem from '../../shared/list-items/GameListItem';
import StrategicGameListActions from './StrategicGameListActions';

const StrategicGameList = () => {
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState([]);

  const bindStrategicGames = () => {
    fetchStrategicGames('', 0, 20)
      .then((response) => {
        setStrategicGames(response);
      })
      .catch((err) => {
        showError(err.message);
      });
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
    </>
  );
};

export default StrategicGameList;
