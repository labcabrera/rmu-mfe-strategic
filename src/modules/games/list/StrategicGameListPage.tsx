/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import {
  ClearableTextField,
  EmptyState,
  EntityCard,
  EnumPicker,
  fetchRealms,
  fetchStrategicGames,
  FilterBar,
  FilterSchema,
  gridSizeShowcase,
  ListPage,
  Realm,
  RealmPicker,
  StrategicGame,
  useListFilters,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_GAME_IMAGE_PATH } from '../../services/image-service';
import StrategicGameCardChips from './StrategicGameCardChips';

/** Statuses of a campaign (rmu-api-strategic GameStatus). */
const GAME_STATUSES = ['open', 'closed'];

export default function StrategicGameListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [realms, setRealms] = useState<Realm[]>([]);
  const schema: FilterSchema<StrategicGame> = {
    q: { kind: 'text', label: t('name'), toRsql: (value) => `name=re=${value}` },
    realm: {
      kind: 'single',
      label: t('realm'),
      format: (id) => t(realms.find((realm) => realm.id === id)?.name ?? id),
      toRsql: (value) => `realmId==${value}`,
    },
    status: {
      kind: 'single',
      label: t('status'),
      options: GAME_STATUSES,
      format: (value) => t(value),
      toRsql: (value) => `status==${value}`,
    },
  };
  const filters = useListFilters(schema);
  const query = usePagedQuery<StrategicGame>({
    fetcher: (q, page, size) => fetchStrategicGames(q, page, size, auth),
    rsql: filters.rsql,
    onError: notify.error,
  });

  // The realms feed the realm filter and the image of the games without their own one.
  useEffect(() => {
    fetchRealms('', 0, 100, auth)
      .then((response) => setRealms(response.content))
      .catch(notify.error);
  }, []);

  const realmImages = useMemo(() => new Map(realms.map((realm) => [realm.id, realm.imageUrl])), [realms]);
  const onCreate = () => navigate('/strategic/games/create');

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games') },
      ]}
      query={query}
      onAdd={onCreate}
      filterState={filters}
      filters={
        <FilterBar>
          <ClearableTextField
            label={t('name')}
            name="q"
            value={filters.get('q')}
            onChange={(value) => filters.set('q', value ?? '')}
          />
          <RealmPicker
            realms={realms}
            variant="select"
            value={filters.get('realm') || null}
            onChange={(id) => filters.set('realm', id)}
            allowAll
          />
          <EnumPicker
            label={t('status')}
            values={GAME_STATUSES}
            variant="select"
            value={filters.get('status') || null}
            onChange={(id) => filters.set('status', id)}
            allowAll
          />
        </FilterBar>
      }
      collection={{ modes: ['cards'], storageKey: 'strategic.games', cardSize: gridSizeShowcase }}
      emptyState={
        <EmptyState
          title={t('no-strategic-games')}
          description={t('no-strategic-games-description')}
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 1 }}>
              {t('create-strategic-game')}
            </Button>
          }
        />
      }
      renderItem={(strategicGame) => (
        <EntityCard
          title={strategicGame.name}
          subtitle={strategicGame.realmName}
          image={strategicGame.imageUrl || realmImages.get(strategicGame.realmId) || DEFAULT_GAME_IMAGE_PATH}
          chips={<StrategicGameCardChips strategicGame={strategicGame} />}
          description={strategicGame.shortDescription || strategicGame.description || t('no-description')}
          descriptionLines={3}
          onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame } })}
        />
      )}
    />
  );
}
