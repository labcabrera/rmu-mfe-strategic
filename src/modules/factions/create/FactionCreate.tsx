import React, { FC, use, useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { CreateFactionDto, EMPTY_FACTION } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import GenericAvatar from '../../shared/avatars/GenericAvatar';
import FactionCreateActions from './FactionCreateActions';
import FactionCreateAttributes from './FactionCreateAttributes';

const FactionCreate: FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showError } = useError();
  const gameId = searchParams.get('gameId');
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<CreateFactionDto>(EMPTY_FACTION);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(!!formData.name && !!formData.gameId);
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      setFormData({ ...formData, gameId: strategicGame.id });
    }
  }, [strategicGame]);

  useEffect(() => {
    if (location.state?.strategicGame && !formData.gameId) {
      setStrategicGame(location.state.strategicGame);
    } else if (gameId) {
      fetchStrategicGame(gameId)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId]);

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <>
      <FactionCreateActions formData={formData} strategicGame={strategicGame} isValid={isValid} />
      <Grid container spacing={5} sx={{ mb: 5 }}>
        <Grid size={2}>
          <GenericAvatar imageUrl="/static/images/avatars/avatar-001.png" size={300} />
          <TextField
            label={t('faction-name')}
            variant="standard"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!formData.name}
            helperText={!formData.name ? t('required-field') : ' '}
            fullWidth
          />
          <TextField
            label={t('description')}
            variant="standard"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            maxRows={12}
          />
        </Grid>
        <Grid size={7}>
          <FactionCreateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default FactionCreate;
