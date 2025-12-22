import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { fetchTacticalGames, TacticalGame } from '../../api/tactical-games';
import { getGenericImages } from '../../services/image-service';
import ImageSelectorDialog from '../../shared/images/ImageSelectorDialog';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewResume from './StrategicGameViewResume';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

const StrategicGameView: React.FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(location.state?.strategicGame || null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

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
      <Grid container spacing={5}>
        <Grid size={2}>
          <StrategicGameViewResume strategicGame={strategicGame} setGame={setStrategicGame} />
        </Grid>
        <Grid size={9}>
          <StrategicGameViewAttributes strategicGame={strategicGame} />
          <StrategicGameViewFactions strategicGame={strategicGame} factions={factions} />
          <StrategicGameViewTacticalGames strategicGame={strategicGame} tacticalGames={tacticalGames} />
        </Grid>
      </Grid>
      <ImageSelectorDialog
        open={imageDialogOpen}
        images={getGenericImages()}
        onClose={() => setImageDialogOpen(false)}
        onSelect={() => {}}
      />
    </>
  );
};

export default StrategicGameView;
