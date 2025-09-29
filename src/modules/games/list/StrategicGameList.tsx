import React, { FC, useEffect, useState } from 'react';
import { Grid, Box, Typography, Pagination } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGamesPaged } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import StrategicGameCard from '../../shared/cards/StrategicGameCard';
import StrategicGameListActions from './StrategicGameListActions';
import StrategicGameListResume from './StrategicGameListResume';

const pageSize = 12;

const StrategicGameList: FC = () => {
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);

  const bindStrategicGames = (pageNumber: number = page) => {
    fetchStrategicGamesPaged('', pageNumber, pageSize)
      .then((response) => {
        setStrategicGames(response.content);
        setTotalCount(response.pagination.totalElements);
      })
      .catch((err) => showError(err.message));
  };

  const onPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const newPage = value - 1;
    setPage(newPage);
    bindStrategicGames(newPage);
  };

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
        <Grid size={10}>
          <>
            <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {strategicGames.map((game) => (
                <StrategicGameCard key={game.id} strategicGame={game} />
              ))}
            </Box>
            {strategicGames.length === 0 && (
              <Typography variant="body1" color="text.secondary">
                No games found.
              </Typography>
            )}
            <Box display="flex" justifyContent="center" mt={5}>
              <Pagination count={totalPages} page={page + 1} onChange={onPageChange} color="primary" />
            </Box>
          </>
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameList;
