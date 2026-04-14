import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { fetchStrategicGames, RmuPagination, RmuTextCard, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeMain, gridSizeResume, gridSizeCard } from '../../services/display';
import StrategicGameListActions from './StrategicGameListActions';
import StrategicGameListSearch from './StrategicGameListSearch';

const StrategicGameList: FC = () => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  const [queryString, setQueryString] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);

  const bindStrategicGames = () => {
    fetchStrategicGames(queryString, page, pageSize)
      .then((response) => {
        setStrategicGames(response.content);
        setTotalCount(response.pagination.totalElements);
      })
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    bindStrategicGames();
  }, [queryString, page, pageSize]);

  return (
    <>
      <StrategicGameListActions />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}></Grid>
        <Grid size={gridSizeMain}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <StrategicGameListSearch setQueryString={setQueryString} />
            </Grid>
            <Grid size={12}>
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
                {strategicGames.length === 0 && <>No games found.</>}
              </Grid>
            </Grid>
            <Grid size={12}>
              <RmuPagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameList;
