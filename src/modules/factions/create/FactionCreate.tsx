import React, { FC, use, useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  CreateFactionDto,
  EditableAvatar,
  EMPTY_FACTION,
  fetchStrategicGame,
  StrategicGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { getAvatarImages } from '../../services/image-service';
import FactionForm from '../shared/FactionForm';
import FactionCreateActions from './FactionCreateActions';

const defaultImage = `${imageBaseUrl}images/avatars/avatar-001.png`;

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
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2 }}>
          <EditableAvatar
            imageUrl={formData.imageUrl || defaultImage}
            onImageChange={(newImageUrl) => setFormData({ ...formData, imageUrl: newImageUrl })}
            images={getAvatarImages()}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <FactionForm formData={formData} setFormData={setFormData} />
          <TechnicalInfo>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default FactionCreate;
