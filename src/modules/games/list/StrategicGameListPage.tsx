import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  fetchStrategicGames,
  ListPage,
  RmuTextCard,
  StrategicGame,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import StrategicGameListFilters from './StrategicGameListFilters';

export default function StrategicGameListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [rsql, setRsql] = useState('');
  const query = usePagedQuery<StrategicGame>({
    fetcher: (q, page, size) => fetchStrategicGames(q, page, size, auth),
    rsql,
    onError: notify.error,
  });

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games') },
      ]}
      query={query}
      onAdd={() => navigate('/strategic/games/create')}
      filters={<StrategicGameListFilters onChange={setRsql} />}
      renderItem={(strategicGame) => (
        <RmuTextCard
          value={strategicGame.name}
          subtitle={strategicGame.realmName}
          image={strategicGame.imageUrl || ''}
          onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame } })}
        />
      )}
    />
  );
}
