import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  Faction,
  fetchFactions,
  ListPage,
  RmuTextCard,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import FactionListFilters from './FactionListFilters';

export default function FactionListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [rsql, setRsql] = useState('');
  const query = usePagedQuery<Faction>({
    fetcher: (q, page, size) => fetchFactions(q, page, size, auth),
    rsql,
    onError: notify.error,
  });

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('factions') },
      ]}
      query={query}
      filters={<FactionListFilters onChange={setRsql} />}
      renderItem={(faction) => (
        <RmuTextCard
          value={faction.name}
          subtitle={faction.shortDescription || 'No description provided'}
          image={faction.imageUrl || ''}
          onClick={() => navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } })}
        />
      )}
    />
  );
}
