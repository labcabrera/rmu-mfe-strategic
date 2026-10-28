/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  ClearableTextField,
  Faction,
  fetchFactions,
  fetchStrategicGames,
  FilterBar,
  FilterSchema,
  gridSizeShowcase,
  ListPage,
  StrategicGame,
  StrategicGamePicker,
  useListFilters,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import FactionCard from '../FactionCard';

export default function FactionListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [games, setGames] = useState<StrategicGame[]>([]);
  const schema: FilterSchema<Faction> = {
    q: { kind: 'text', label: t('name'), toRsql: (value) => `name=re=${value}` },
    game: {
      kind: 'single',
      label: t('strategic-game'),
      format: (id) => games.find((game) => game.id === id)?.name ?? id,
      toRsql: (value) => `gameId==${value}`,
    },
  };
  const filters = useListFilters(schema);
  // Names of the games of the factions shown, by id: one request per page, only for the games not known yet.
  const [gameNames, setGameNames] = useState<Record<string, string>>({});
  const query = usePagedQuery<Faction>({
    fetcher: (q, page, size) => fetchFactions(q, page, size, auth),
    rsql: filters.rsql,
    onError: notify.error,
  });

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setGames(response.content))
      .catch(notify.error);
  }, []);

  useEffect(() => {
    const missing = [...new Set((query.items ?? []).map((faction) => faction.gameId))].filter(
      (gameId) => gameId && !(gameId in gameNames)
    );
    if (missing.length === 0) return;
    fetchStrategicGames(`id=in=(${missing.join(',')})`, 0, missing.length, auth)
      .then((response) =>
        setGameNames((previous) => ({
          ...previous,
          ...Object.fromEntries(response.content.map((game) => [game.id, game.name])),
        }))
      )
      .catch(notify.error);
  }, [query.items]);

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('factions') },
      ]}
      query={query}
      onAdd={() => navigate('/strategic/factions/create')}
      filterState={filters}
      filters={
        <FilterBar>
          <ClearableTextField
            label={t('name')}
            name="q"
            value={filters.get('q')}
            onChange={(value) => filters.set('q', value ?? '')}
          />
          <StrategicGamePicker
            games={games}
            variant="select"
            value={filters.get('game') || null}
            onChange={(id) => filters.set('game', id)}
            allowAll
          />
        </FilterBar>
      }
      collection={{ modes: ['cards'], storageKey: 'strategic.factions', cardSize: gridSizeShowcase }}
      renderItem={(faction) => (
        <FactionCard
          faction={faction}
          subtitle={gameNames[faction.gameId]}
          onClick={() => navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } })}
        />
      )}
    />
  );
}
