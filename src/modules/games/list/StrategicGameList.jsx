import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGames } from '../../api/strategic-games';
import GameListItem from '../../shared/list-items/GameListItem';
import StrategicGameListActions from './StrategicGameListActions';

const StrategicGameList = () => {
  const { t } = useTranslation();
  const { showError } = useError();
  const navigate = useNavigate();
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

  const handleNewGame = async () => {
    navigate('/strategic/games/create');
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
      {strategicGames.length === 0 ? (
        <>
          <p>
            No games found.{' '}
            <Link component="button" onClick={handleNewGame}>
              {t('create-new')}
            </Link>
          </p>
        </>
      ) : null}
    </>
  );
};

export default StrategicGameList;
