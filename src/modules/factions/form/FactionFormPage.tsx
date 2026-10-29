/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  addFactionGold,
  createFaction,
  EditableAvatar,
  ErrorState,
  Faction,
  fetchFaction,
  fetchStrategicGame,
  FormPage,
  imageBaseUrl,
  LoadingState,
  NotFound,
  StrategicGame,
  TechnicalInfo,
  updateFaction,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import StrategicGameRequired from '../../shared/StrategicGameRequired';
import FactionForm from './FactionForm';

const EMPTY_FACTION = {
  gameId: '',
  name: '',
  management: {
    availableGold: 100,
  },
  shortDescription: '',
  description: '',
  imageUrl: 'images/generic/faction.png',
} as Faction;

const toFormData = (faction: Faction) =>
  ({
    name: faction.name || '',
    management: {
      availableGold: faction.management?.availableGold || 0,
    },
    shortDescription: faction.shortDescription || '',
    description: faction.description || '',
    imageUrl: faction.imageUrl || '',
  }) as unknown as Faction;

/**
 * Create and edit page of a faction. Creation needs the strategic game (`gameId` query param) and
 * asks for it when it is missing.
 */
export default function FactionFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();
  const { factionId } = useParams<{ factionId?: string }>();
  const gameId = mode === 'create' ? searchParams.get('gameId') || undefined : undefined;
  const initialGame: StrategicGame | undefined = location.state?.strategicGame;
  const game = useEntity<StrategicGame>(gameId, (id) => fetchStrategicGame(id, auth), {
    initial: initialGame && initialGame.id === gameId ? initialGame : undefined,
    onError: notify.error,
  });
  const existing = useEntity<Faction>(mode === 'edit' ? factionId : undefined, (id) => fetchFaction(id, auth), {
    initial: location.state?.faction,
    onError: notify.error,
  });
  const [formData, setFormData] = useState<Faction>();
  const [initialData, setInitialData] = useState<string>();
  const source = mode === 'create' ? game : existing;

  useEffect(() => {
    let data: Faction | undefined;
    if (mode === 'create' && game.entity) data = { ...EMPTY_FACTION, gameId: game.entity.id };
    if (mode === 'edit' && existing.entity && !formData) data = toFormData(existing.entity);
    if (!data) return;
    setFormData(data);
    setInitialData(JSON.stringify(data));
  }, [game.entity, existing.entity]);

  /**
   * rmu-api-strategic ignores `management` in the PATCH (spec 021, F-strategic-16): the gold edited here is sent as the
   * difference through add-gold, which only the game owner or an admin may call.
   */
  const saveEdit = async (data: Faction): Promise<Faction> => {
    const { management, ...rest } = data;
    const before = existing.entity?.management;
    let saved = await updateFaction(factionId!, rest, auth);
    const gold = management.availableGold - (before?.availableGold ?? 0);
    if (gold !== 0) saved = await addFactionGold(factionId!, gold, auth);
    return saved;
  };

  const onSave = () => {
    if (!formData) return;
    const request = mode === 'create' ? createFaction(formData, auth) : saveEdit(formData);
    request
      .then((data: Faction) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch(notify.error);
  };

  const onCancel = () => {
    if (mode === 'create') navigate(`/strategic/games/view/${gameId}`);
    else navigate(`/strategic/factions/view/${factionId}`, { state: { faction: existing.entity } });
  };

  const breadcrumbs = [
    { name: t('home'), link: '/' },
    { name: t('strategic-module'), link: '/strategic' },
    { name: t('factions'), link: '/strategic/factions' },
    { name: t(mode === 'create' ? 'create' : 'edit') },
  ];

  if (mode === 'create' && !gameId) {
    return (
      <StrategicGameRequired
        breadcrumbs={breadcrumbs}
        onCancel={() => navigate('/strategic/factions')}
        onSelect={(id) =>
          setSearchParams((params) => {
            params.set('gameId', id);
            return params;
          })
        }
      />
    );
  }

  return (
    <FormPage
      breadcrumbs={breadcrumbs}
      onSave={onSave}
      onCancel={onCancel}
      saveDisabled={!formData?.name || (mode === 'create' && !formData.gameId)}
      dirty={!!formData && JSON.stringify(formData) !== initialData}
      leftPanel={
        formData && (
          <EditableAvatar
            imageUrl={formData.imageUrl || `${imageBaseUrl}images/generic/faction.png`}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        )
      }
    >
      {formData ? (
        <>
          <FactionForm formData={formData} setFormData={setFormData as Dispatch<SetStateAction<Faction>>} />
          <TechnicalInfo>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </>
      ) : source.notFound ? (
        <NotFound />
      ) : source.error ? (
        <ErrorState error={source.error} onRetry={source.refresh} />
      ) : (
        <LoadingState variant="detail" />
      )}
    </FormPage>
  );
}
