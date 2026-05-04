import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import {
  EditableAvatar,
  Faction,
  fetchStrategicGame,
  StrategicGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { gridSizeMain, gridSizeResume } from '../../services/display';
import { getAvatarImages } from '../../services/image-service';
import FactionForm from '../form/FactionForm';
import FactionCreateActions from './FactionCreateActions';

export const EMPTY_FACTION = {
  gameId: '',
  name: '',
  management: {
    availableGold: 100,
    availableXP: 200000,
  },
  shortDescription: '',
  description: '',
  imageUrl: `${imageBaseUrl}images/generic/faction.png`,
} as Faction;

const FactionCreate: FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showError } = useError();
  const gameId = searchParams.get('gameId');
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<Faction>(EMPTY_FACTION);
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
      fetchStrategicGame(gameId, auth)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId]);

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <Grid container spacing={1}>
      <Grid size={gridSizeResume}>
        <EditableAvatar
          imageUrl={formData.imageUrl || `${imageBaseUrl}images/generic/faction.png`}
          onImageChange={(newImageUrl) => setFormData({ ...formData, imageUrl: newImageUrl })}
          images={getAvatarImages()}
        />
      </Grid>
      <Grid size={gridSizeMain}>
        <FactionCreateActions formData={formData} strategicGame={strategicGame} isValid={isValid} />
        <Paper sx={{ p: 2 }}>
          <FactionForm formData={formData} setFormData={setFormData} />
        </Paper>
        <TechnicalInfo>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </TechnicalInfo>
      </Grid>
    </Grid>
  );
};

export default FactionCreate;
