import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  CategorySeparator,
  AddButton,
  TechnicalInfo,
  StrategicGame,
  fetchStrategicGame,
  Faction,
  fetchFactions,
  fetchTacticalGames,
  TacticalGame,
  LayoutBase,
  RefreshButton,
  EditButton,
  DeleteButton,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeMain, gridSizeResume } from '../../services/display';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewPowerLevel from './StrategicGameViewPowerLevel';
import StrategicGameViewResume from './StrategicGameViewResume';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

export default function StrategicGameView() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>(location.state?.strategicGame);
  const [factions, setFactions] = useState<Faction[]>();
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onCreateFaction = () => {
    navigate(`/strategic/factions/create?gameId=${strategicGame.id}`, { state: { strategicGame } });
  };

  const onCreateTacticalGame = () => {
    navigate(`/tactical/games/create?strategicGame=${strategicGame.id}`);
  };

  const bindStrategicGame = (gameId: string) => {
    fetchStrategicGame(gameId, auth)
      .then((data) => setStrategicGame(data))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (strategicGame) {
      fetchFactions(`gameId==${strategicGame.id}`, 0, 100, auth)
        .then((data) => setFactions(data.content))
        .catch((err) => showError(err.message));
      fetchTacticalGames(`strategicGameId==${gameId}`, 0, 100, auth)
        .then((data) => setTacticalGames(data.content))
        .catch((err) => showError(err.message));
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state?.strategicGame) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      bindStrategicGame(gameId);
    }
  }, [location.state, gameId]);

  // if (!strategicGame || !factions || !tacticalGames) return <div>Loading...</div>;

  return (
    <>
      <LayoutBase
        breadcrumbs={[
          { name: t('home'), link: '/' },
          { name: t('strategic-games'), link: '/strategic/games' },
          { name: t('view') },
        ]}
        actions={[
          <RefreshButton onClick={() => bindStrategicGame(strategicGame!.id)} />,
          <EditButton
            onClick={() => navigate(`/strategic/games/edit/${strategicGame.id}`, { state: { strategicGame } })}
          />,
          <DeleteButton onClick={() => setDeleteDialogOpen(true)} />,
        ]}
        leftPanel={<StrategicGameViewResume strategicGame={strategicGame} setStrategicGame={setStrategicGame} />}
      >
        <CategorySeparator text={t('settings')} />
        <StrategicGameViewAttributes strategicGame={strategicGame} />
        <CategorySeparator text={t('power-level')} />
        <StrategicGameViewPowerLevel strategicGame={strategicGame} />
        <CategorySeparator text={t('factions')}>
          <AddButton onClick={onCreateFaction} />
        </CategorySeparator>
        <StrategicGameViewFactions factions={factions} />
        <CategorySeparator text={t('tactical-games')}>
          <AddButton onClick={onCreateTacticalGame} />
        </CategorySeparator>
        <StrategicGameViewTacticalGames tacticalGames={tacticalGames} factions={factions} />
        <TechnicalInfo>
          <pre>StrategicGame: {JSON.stringify(strategicGame, null, 2)}</pre>
        </TechnicalInfo>
      </LayoutBase>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}></Grid>
        <Grid size={gridSizeMain}>
          <StrategicGameViewActions strategicGame={strategicGame} setStrategicGame={setStrategicGame} />
        </Grid>
      </Grid>
    </>
  );
}
