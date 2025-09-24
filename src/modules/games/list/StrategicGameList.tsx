import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Grid, Box, Typography, IconButton, Pagination } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { Page } from '../../api/common.dto';
import { fetchStrategicGamesPaged } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import StrategicGameCard from '../../shared/cards/StrategicGameCard';
import StrategicGameListActions from './StrategicGameListActions';
import StrategicGameListResume from './StrategicGameListResume';

const pageSize = 24;

const StrategicGameList: FC = () => {
  const { showError } = useError();
  const navigate = useNavigate();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const bindStrategicGames = (pageNumber: number = page) => {
    setLoading(true);
    fetchStrategicGamesPaged('', pageNumber, pageSize)
      .then((response) => {
        setStrategicGames(response.content);
        setTotalCount(response.pagination.totalElements);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('Unknown error fetching games');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleNewGame = () => {
    navigate('/strategic/games/create');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const newPage = value - 1; // Pagination usa 1-based, pero la API usa 0-based
    setPage(newPage);
    bindStrategicGames(newPage);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    bindStrategicGames();
  }, []);

  return (
    <>
      <StrategicGameListActions />
      <Grid container spacing={2} mb={2} alignItems="flex-start">
        <Grid size={2}>
          <StrategicGameListResume />
        </Grid>
        <Grid size={8}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6" color="primary">
              {t('strategic-games')}
            </Typography>
            <IconButton onClick={handleNewGame} color="primary">
              <AddCircleIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <>
              <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
                {strategicGames.map((game) => (
                  <StrategicGameCard key={game.id} strategicGame={game} />
                ))}
              </Box>

              {strategicGames.length === 0 && !loading && (
                <Typography variant="body1" color="text.secondary">
                  No games found.
                </Typography>
              )}
              <Box display="flex" justifyContent="center" mt={5}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameList;
