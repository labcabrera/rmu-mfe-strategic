import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Grid, Paper } from '@mui/material';
import {
  CreateStrategicGameDto,
  EditableAvatar,
  fetchRealms,
  Realm,
  StrategicGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { DEFAULT_REALM_IMAGE, getAvatarImages } from '../../services/image-service';
import StrategicGameForm from '../shared/StrategicGameForm';
import StrategicGameCreateActions from './StrategicGameCreateActions';

const EMPTY_STRATEGIC_GAME = {
  name: '',
  realmId: '',
  options: {
    experienceMultiplier: 1,
    fatigueMultiplier: 1,
    boardScaleMultiplier: 1,
    letality: 0,
  },
  powerLevel: {
    baseDevPoints: 60,
    statRandomMin: 11,
    statBoostPotential: 78,
    statBoostTemporary: 56,
    statCreationBoost: 2,
    statCreationSwap: 2,
  },
  description: '',
  imageUrl: `${imageBaseUrl}images/generic/strategic.png`,
} as StrategicGame;

const StrategicGameCreate: FC = () => {
  const { showError } = useError();
  const auth = useAuth();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [formData, setFormData] = useState<StrategicGame>(EMPTY_STRATEGIC_GAME);
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateForm = (formData: CreateStrategicGameDto) => {
    return !!formData.name && !!formData.realmId;
  };

  useEffect(() => {
    setIsValid(validateForm(formData));
  }, [formData]);

  useEffect(() => {
    fetchRealms('', 0, 100, auth)
      .then((data) => setRealms(data.content))
      .catch((err) => showError(err.message));
  }, []);

  if (!realms) return <div>Loading...</div>;

  return (
    <Grid container spacing={1}>
      <Grid size={gridSizeResume}>
        <EditableAvatar
          imageUrl={formData.imageUrl || DEFAULT_REALM_IMAGE}
          onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          images={getAvatarImages()}
        />
      </Grid>
      <Grid size={gridSizeMain}>
        <StrategicGameCreateActions formData={formData} isValid={isValid} />
        <Paper sx={{ p: 2 }}>
          <StrategicGameForm formData={formData} setFormData={setFormData} realms={realms} />
        </Paper>
        <TechnicalInfo>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </TechnicalInfo>
      </Grid>
    </Grid>
  );
};

export default StrategicGameCreate;
