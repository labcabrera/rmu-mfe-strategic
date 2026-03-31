import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Pagination } from '@mui/material';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGamesPaged } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { gridSizeMain, gridSizeResume, gridSizeCard } from '../../services/display';
import StrategicGameListActions from './StrategicGameListActions';

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
        <Grid size={gridSizeResume}></Grid>
        <Grid size={gridSizeMain}>
          <Grid container spacing={1}>
            {strategicGames.map((game, index) => (
              <Grid key={index} size={gridSizeCard}>
                <RmuTextCard
                  value={game.name}
                  subtitle={game.realmName}
                  image={game.imageUrl || ''}
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
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameList;
