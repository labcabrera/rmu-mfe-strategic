import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link, Grid, List, Box } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGames } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import StrategicGameCard from '../../shared/cards/StrategicGameCard';
import StrategicGameListActions from './StrategicGameListActions';

const StrategicGameList: FC = () => {
  const { t } = useTranslation();
  const { showError } = useError();
  const navigate = useNavigate();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);

  const bindStrategicGames = () => {
    fetchStrategicGames('', 0, 24)
      .then((response: StrategicGame[]) => {
        setStrategicGames(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('Unknown error fetching games');
      });
  };

  const handleNewGame = () => {
    navigate('/strategic/games/create');
  };

  useEffect(() => {
    bindStrategicGames();
  }, []);

  return (
    <>
      <StrategicGameListActions />
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid size={12}>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {strategicGames.map((game) => (
              <StrategicGameCard key={game.id} strategicGame={game} />
            ))}
          </Box>
        </Grid>
      </Grid>
      {strategicGames.length === 0 ? (
        <p>
          No games found.{' '}
          <Link component="button" onClick={handleNewGame}>
            {t('create-new')}
          </Link>
        </p>
      ) : null}
    </>
  );
};

export default StrategicGameList;
