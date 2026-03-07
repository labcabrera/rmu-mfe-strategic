import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { fetchTacticalGames, TacticalGame } from '../../api/tactical-games';
import AddButton from '../../shared/buttons/AddButton';
import CategorySeparator from '../../shared/display/CategorySeparator';
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
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

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
      <Grid container spacing={1} padding={1}>
        <Grid size={{ xs: 12, md: 2 }}>
          <StrategicGameViewResume strategicGame={strategicGame} setStrategicGame={setStrategicGame} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <CategorySeparator text={t('options')} />
          <StrategicGameViewAttributes strategicGame={strategicGame} />
          <CategorySeparator text={t('power-level')} />
          <StrategicGameViewPowerLevel strategicGame={strategicGame} />
          <CategorySeparator text={t('factions')}>
            <AddButton onClick={onCreateFaction} />
          </CategorySeparator>
          <StrategicGameViewFactions strategicGame={strategicGame} factions={factions} />
          <CategorySeparator text={t('tactical-games')}>
            <AddButton onClick={onCreateTacticalGame} />
          </CategorySeparator>
          <StrategicGameViewTacticalGames strategicGame={strategicGame} tacticalGames={tacticalGames} />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameView;
