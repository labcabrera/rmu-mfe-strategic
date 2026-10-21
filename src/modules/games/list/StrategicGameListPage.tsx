/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import {
  EmptyState,
  EntityCard,
  fetchRealms,
  fetchStrategicGames,
  gridSizeShowcase,
  ListPage,
  Realm,
  StrategicGame,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_GAME_IMAGE_PATH } from '../../services/image-service';
import StrategicGameCardChips from './StrategicGameCardChips';
import StrategicGameListFilters from './StrategicGameListFilters';

export default function StrategicGameListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [rsql, setRsql] = useState('');
  const [realms, setRealms] = useState<Realm[]>([]);
  const query = usePagedQuery<StrategicGame>({
    fetcher: (q, page, size) => fetchStrategicGames(q, page, size, auth),
    rsql,
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
      filters={<StrategicGameListFilters realms={realms} onChange={setRsql} />}
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
