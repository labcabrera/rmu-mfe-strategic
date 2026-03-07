import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Pagination } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGamesPaged } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import RmuTextCard from '../../shared/cards/RmuTextCard';
import StrategicGameListActions from './StrategicGameListActions';
import StrategicGameListResume from './StrategicGameListResume';

const pageSize = 24;

const StrategicGameList: FC = () => {
  const navigate = useNavigate();
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
      <Grid container spacing={1}>
        <Grid size={2} sx={{ display: { xs: 'none', md: 'block' } }}>
          <StrategicGameListResume />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={1}>
            {strategicGames.map((game) => (
              <Grid key={game.id} size={{ xs: 12, md: 3 }}>
                <RmuTextCard
                  value={game.name}
                  subtitle={game.realmName}
                  image={game.imageUrl || undefined}
                  onClick={() => navigate(`/strategic/games/view/${game.id}`, { state: { game } })}
                />
              </Grid>
            ))}
          </Grid>

          <Grid size={12}>
            {strategicGames.length === 0 && (
              <Typography variant="body1" color="text.secondary">
                No games found.
              </Typography>
            )}
            <Box display="flex" justifyContent="center" mt={5}>
              <Pagination count={totalPages} page={page + 1} onChange={onPageChange} color="primary" />
            </Box>
          </Grid>
          <Grid size={12} sx={{ display: { xs: 'block', md: 'none' } }}>
            <StrategicGameListResume />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameList;
