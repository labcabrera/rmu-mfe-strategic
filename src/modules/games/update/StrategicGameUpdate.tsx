import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame, UpdateStrategicGameDto } from '../../api/strategic-game.dto';
import StrategicGameAvatar from '../../shared/avatars/StrategicGameAvatar';
import StrategicGameUpdateActions from './StrategicGameUpdateActions';
import StrategicGameUpdateAttributes from './StrategicGameUpdateAttributes';
import StrategicGameUpdateResume from './StrategicGameUpdateResume';

const StrategicGameUpdate: FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<UpdateStrategicGameDto | null>(null);

  useEffect(() => {
    if (strategicGame) {
      setFormData({
        name: strategicGame.name,
        description: strategicGame.description,
        options: strategicGame.options,
        powerLevel: strategicGame.powerLevel,
      });
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state && location.state.strategicGame) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      fetchStrategicGame(gameId)
        .then((response) => setStrategicGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId, showError]);

  if (!strategicGame || !formData) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameUpdateActions strategicGame={strategicGame} formData={formData} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <StrategicGameAvatar strategicGame={strategicGame} size={300} />
          <StrategicGameUpdateResume formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={7}>
          <StrategicGameUpdateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default StrategicGameUpdate;
