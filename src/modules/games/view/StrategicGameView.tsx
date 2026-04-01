import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { CategorySeparator, AddButton, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { fetchTacticalGames, TacticalGame } from '../../api/tactical-games';
import { gridSizeMain, gridSizeResume } from '../../services/display';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewPowerLevel from './StrategicGameViewPowerLevel';
import StrategicGameViewResume from './StrategicGameViewResume';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

const StrategicGameView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>(location.state?.strategicGame || null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>([]);

  const onCreateFaction = () => {
    navigate(`/strategic/factions/create?gameId=${strategicGame.id}`, { state: { strategicGame } });
  };

  const onCreateTacticalGame = () => {
    navigate(`/tactical/games/create?strategicGame=${strategicGame.id}`);
  };

  useEffect(() => {
    if (strategicGame) {
      fetchFactions(`gameId==${strategicGame.id}`, 0, 100)
        .then((data) => setFactions(data))
        .catch((err) => showError(err.message));
      fetchTacticalGames(`strategicGameId==${gameId}`, 0, 100)
        .then((data) => setTacticalGames(data))
        .catch((err) => showError(err.message));
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state?.strategicGame) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      fetchStrategicGame(gameId)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId, showError]);

  if (!strategicGame || !factions) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameViewActions strategicGame={strategicGame} setStrategicGame={setStrategicGame} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <StrategicGameViewResume strategicGame={strategicGame} setStrategicGame={setStrategicGame} />
        </Grid>
        <Grid size={gridSizeMain}>
          <CategorySeparator text={t('Pptions')} />
          <StrategicGameViewAttributes strategicGame={strategicGame} />
          <CategorySeparator text={t('Power level')} />
          <StrategicGameViewPowerLevel strategicGame={strategicGame} />
          <CategorySeparator text={t('Factions')}>
            <AddButton onClick={onCreateFaction} />
          </CategorySeparator>
          <StrategicGameViewFactions factions={factions} />
          <CategorySeparator text={t('Tactical games')}>
            <AddButton onClick={onCreateTacticalGame} />
          </CategorySeparator>
          <StrategicGameViewTacticalGames tacticalGames={tacticalGames} factions={factions} />
          <TechnicalInfo>
            <pre>StrategicGame: {JSON.stringify(strategicGame, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameView;
