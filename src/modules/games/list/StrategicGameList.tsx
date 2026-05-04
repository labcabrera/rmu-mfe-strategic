import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Grid } from '@mui/material';
import {
  AddButton,
  fetchStrategicGames,
  LayoutBase,
  Page,
  RefreshButton,
  RmuPagination,
  RmuTextCard,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeCard } from '../../services/display';
import StrategicGameListSearch from './StrategicGameListSearch';

export default function StrategicGameList() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [pageData, setPageData] = useState<Page<StrategicGame>>();
  const [rsql, setRsql] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(24);

  const bindStrategicGames = () => {
    fetchStrategicGames(rsql, page, pageSize, auth)
      .then((response) => setPageData(response))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    bindStrategicGames();
  }, [rsql, page, pageSize]);

  return (
    <LayoutBase
      breadcrumbs={[{ name: t('home'), link: '/' }, { name: t('strategic-games') }]}
      actions={[
        <RefreshButton onClick={() => bindStrategicGames()} />,
        <AddButton onClick={() => navigate('/strategic/games/create')} />,
      ]}
    >
      <StrategicGameListSearch setRsql={setRsql} />
      <Grid container spacing={1}>
        {pageData === undefined ? (
          <CircularProgress />
        ) : (
          <>
            {pageData.content.map((game, index) => (
              <Grid key={index} size={gridSizeCard} sx={{ mt: 2 }}>
                <RmuTextCard
                  value={game.name}
                  subtitle={game.realmName}
                  image={game.imageUrl || ''}
                  onClick={() => navigate(`/strategic/games/view/${game.id}`, { state: { game } })}
                />
              </Grid>
            ))}
            {pageData.content.length === 0 && <>No games found.</>}
            <RmuPagination
              page={page}
              pageSize={pageSize}
              totalPages={pageData.pagination.totalPages}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </>
        )}
      </Grid>
    </LayoutBase>
  );
}
