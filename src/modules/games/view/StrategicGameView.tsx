import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { fetchTacticalGames, TacticalGame } from '../../api/tactical-games';
import { getGenericImages } from '../../services/image-service';
import StrategicGameAvatar from '../../shared/avatars/StrategicGameAvatar';
import ImageSelectorDialog from '../../shared/images/ImageSelectorDialog';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

const StrategicGameView: React.FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const params = useParams<{ gameId: string }>();
  const [game, setGame] = useState<StrategicGame | null>(location.state?.strategicGame || null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const bindStrategicGame = (gameId: string) => {
    fetchStrategicGame(gameId)
      .then((data) => {
        setGame(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  const bindTacticalGames = (gameId: string) => {
    fetchTacticalGames(`strategicGameId==${gameId}`, 0, 100)
      .then((data) => {
        setTacticalGames(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  const bindFactions = (gameId: string) => {
    fetchFactions(`gameId==${gameId}`, 0, 100)
      .then((data) => {
        setFactions(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  useEffect(() => {
    if (game) {
      bindFactions(game.id);
      bindTacticalGames(game.id);
    }
  }, [game]);

  useEffect(() => {
    if (location.state?.strategicGame) {
      setGame(location.state.strategicGame);
    }
    if (params.gameId) {
      bindStrategicGame(params.gameId);
    }
  }, [location.state, params.gameId]);

  if (!game) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameViewActions strategicGame={game} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <StrategicGameAvatar strategicGame={game} size={200} onClick={() => setImageDialogOpen(true)} />
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {t(game.name)}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t(game.realmName)}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
            {game.description}
          </Typography>
        </Grid>
        <Grid size={9}>
          <StrategicGameViewAttributes strategicGame={game} />
          <StrategicGameViewFactions strategicGame={game} factions={factions} />
          <StrategicGameViewTacticalGames strategicGame={game} tacticalGames={tacticalGames} />
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
