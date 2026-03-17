import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame, UpdateStrategicGameDto } from '../../api/strategic-game.dto';
import EditableAvatar from '../../shared/avatars/EditableAvatar';
import StrategicGameForm from '../shared/StrategicGameForm';
import StrategicGameUpdateActions from './StrategicGameUpdateActions';

const StrategicGameUpdate: FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<UpdateStrategicGameDto | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validateForm = (data: UpdateStrategicGameDto) => {
    if (!data.name || data.name.trim() === '') return false;
    return true;
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

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
      <StrategicGameUpdateActions strategicGame={strategicGame} formData={formData} isValid={isValid} />
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2 }}>
          <EditableAvatar
            imageUrl={strategicGame.imageUrl || ''}
            onImageChange={function (newImageUrl: string): void {
              throw new Error('Function not implemented.');
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <StrategicGameForm formData={formData} setFormData={setFormData} create={false} />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameUpdate;
