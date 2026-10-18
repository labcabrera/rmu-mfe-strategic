/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AddButton,
  CategorySeparator,
  deleteStrategicGame,
  DetailPage,
  Faction,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGames,
  StrategicGame,
  TacticalGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewPowerLevel from './StrategicGameViewPowerLevel';
import StrategicGameViewResume from './StrategicGameViewResume';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

export default function StrategicGameViewPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const notify = useNotify();
  const { gameId } = useParams<{ gameId?: string }>();
  const state = useEntity<StrategicGame>(gameId, (id) => fetchStrategicGame(id, auth), {
    initial: location.state?.strategicGame,
    onError: notify.error,
  });
  const strategicGame = state.entity;
  const [factions, setFactions] = useState<Faction[]>();
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>();

  useEffect(() => {
    if (!strategicGame) return;
    fetchFactions(`gameId==${strategicGame.id}`, 0, 100, auth)
      .then((data) => setFactions(data.content))
      .catch(notify.error);
    fetchTacticalGames(`strategicGameId==${strategicGame.id}`, 0, 100, auth)
      .then((data) => setTacticalGames(data.content))
      .catch(notify.error);
  }, [strategicGame]);

  const onDelete = (game: StrategicGame) =>
    deleteStrategicGame(game.id, auth)
      .then(() => navigate('/strategic/games', { replace: true }))
      .catch(notify.error);

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: t('view') },
      ]}
      entity={state}
      summaryTitle={(entity) => t(entity.name)}
      onEdit={(game) => navigate(`/strategic/games/edit/${game.id}`, { state: { strategicGame: game } })}
      onDelete={onDelete}
      leftPanel={(game) => <StrategicGameViewResume strategicGame={game} setStrategicGame={state.setEntity} />}
    >
      {(game) => (
        <>
          <CategorySeparator text={t('settings')} />
          <StrategicGameViewAttributes strategicGame={game} />
          <CategorySeparator text={t('power-level')} />
          <StrategicGameViewPowerLevel strategicGame={game} />
          <CategorySeparator text={t('factions')}>
            <AddButton
              onClick={() =>
                navigate(`/strategic/factions/create?gameId=${game.id}`, { state: { strategicGame: game } })
              }
            />
          </CategorySeparator>
          <StrategicGameViewFactions factions={factions} />
          <CategorySeparator text={t('tactical-games')}>
            <AddButton onClick={() => navigate(`/tactical/games/create?strategicGame=${game.id}`)} />
          </CategorySeparator>
          <StrategicGameViewTacticalGames tacticalGames={tacticalGames} factions={factions} />
        </>
      )}
    </DetailPage>
  );
}
