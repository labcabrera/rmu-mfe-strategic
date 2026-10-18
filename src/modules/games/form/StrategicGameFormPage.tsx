/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  createStrategicGame,
  EditableAvatar,
  ErrorState,
  fetchRealms,
  fetchStrategicGame,
  FormPage,
  LoadingState,
  NotFound,
  Realm,
  StrategicGame,
  TechnicalInfo,
  updateStrategicGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_REALM_IMAGE } from '../../services/image-service';
import StrategicGameForm from './StrategicGameForm';

const EMPTY_STRATEGIC_GAME = {
  name: '',
  realmId: '',
  options: {
    experienceMultiplier: 1,
    fatigueMultiplier: 1,
    boardScaleMultiplier: 1,
    letality: 0,
  },
  powerLevel: {
    baseDevPoints: 60,
    statRandomMin: 11,
    statBoostPotential: 78,
    statBoostTemporary: 56,
    statCreationBoost: 2,
    statCreationSwap: 2,
  },
  description: '',
  imageUrl: 'images/generic/strategic.png',
} as StrategicGame;

/** Create and edit page of a strategic game. The realm can only be chosen on creation. */
export default function StrategicGameFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { gameId } = useParams<{ gameId?: string }>();
  const existing = useEntity<StrategicGame>(
    mode === 'edit' ? gameId : undefined,
    (id) => fetchStrategicGame(id, auth),
    { initial: location.state?.strategicGame, onError: notify.error }
  );
  const [realms, setRealms] = useState<Realm[]>([]);
  const [formData, setFormData] = useState<StrategicGame>();
  const [initialData, setInitialData] = useState<string>();

  useEffect(() => {
    if (formData) return;
    let data: StrategicGame | undefined = EMPTY_STRATEGIC_GAME;
    if (mode === 'edit') {
      if (!existing.entity) return;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { id, owner, ...rest } = existing.entity;
      data = rest as StrategicGame;
    }
    setFormData(data);
    setInitialData(JSON.stringify(data));
  }, [existing.entity]);

  useEffect(() => {
    if (mode !== 'create') return;
    fetchRealms('', 0, 100, auth)
      .then((data) => setRealms(data.content))
      .catch(notify.error);
  }, []);

  const onSave = () => {
    if (!formData) return;
    const request =
      mode === 'create' ? createStrategicGame(formData, auth) : updateStrategicGame(gameId!, formData, auth);
    request
      .then((data: StrategicGame) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch(notify.error);
  };

  const onCancel = () => {
    if (mode === 'create') navigate('/strategic/games');
    else navigate(`/strategic/games/view/${gameId}`, { state: { strategicGame: existing.entity } });
  };

  const isValid = !!formData?.name?.trim() && (mode === 'edit' || !!formData.realmId);

  return (
    <FormPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: t(mode === 'create' ? 'create' : 'edit') },
      ]}
      onSave={onSave}
      onCancel={onCancel}
      saveDisabled={!isValid}
      dirty={!!formData && JSON.stringify(formData) !== initialData}
      leftPanel={
        formData && (
          <EditableAvatar
            imageUrl={formData.imageUrl || DEFAULT_REALM_IMAGE}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        )
      }
    >
      {formData ? (
        <>
          <StrategicGameForm
            formData={formData}
            setFormData={setFormData as Dispatch<SetStateAction<StrategicGame>>}
            realms={mode === 'create' ? realms : undefined}
          />
          <TechnicalInfo>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </>
      ) : existing.notFound ? (
        <NotFound />
      ) : existing.error ? (
        <ErrorState error={existing.error} onRetry={existing.refresh} />
      ) : (
        <LoadingState variant="detail" />
      )}
    </FormPage>
  );
}
