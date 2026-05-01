import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useParams } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import {
  EditableAvatar,
  fetchStrategicGame,
  StrategicGame,
  UpdateStrategicGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import StrategicGameForm from '../shared/StrategicGameForm';
import StrategicGameUpdateActions from './StrategicGameUpdateActions';

const StrategicGameUpdate: FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<StrategicGame>({} as StrategicGame);
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
      const { id, owner, ...rest } = strategicGame;
      setFormData(rest as StrategicGame);
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state && location.state.strategicGame) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      fetchStrategicGame(gameId, auth)
        .then((response) => setStrategicGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId, showError]);

  if (!strategicGame || !formData.realmId) return <div>Loading...</div>;

  return (
    <Grid container spacing={1}>
      <Grid size={gridSizeResume}>
        <EditableAvatar
          imageUrl={formData.imageUrl || ''}
          onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl: imageUrl })}
          images={[]}
        />
      </Grid>
      <Grid size={gridSizeMain}>
        <StrategicGameUpdateActions strategicGame={strategicGame} formData={formData} isValid={isValid} />
        <Paper sx={{ p: 2 }}>
          <StrategicGameForm formData={formData} setFormData={setFormData} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StrategicGameUpdate;
