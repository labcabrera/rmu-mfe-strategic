import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import {
  CREATE_GAME_TEMPLATE,
  CreateStrategicGameDto,
  EditableAvatar,
  fetchRealms,
  Realm,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { DEFAULT_REALM_IMAGE, getAvatarImages } from '../../services/image-service';
import StrategicGameForm from '../shared/StrategicGameForm';
import StrategicGameCreateActions from './StrategicGameCreateActions';

const StrategicGameCreate: FC = () => {
  const { showError } = useError();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [formData, setFormData] = useState<CreateStrategicGameDto>(CREATE_GAME_TEMPLATE);
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateForm = (formData: CreateStrategicGameDto) => {
    return !!formData.name && !!formData.realmId;
  };

  useEffect(() => {
    setIsValid(validateForm(formData));
  }, [formData]);

  useEffect(() => {
    fetchRealms('', 0, 100)
      .then((data) => setRealms(data.content))
      .catch((err) => showError(err.message));
  }, []);

  if (!realms) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameCreateActions formData={formData} isValid={isValid} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <EditableAvatar
            imageUrl={formData.imageUrl || DEFAULT_REALM_IMAGE}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            images={getAvatarImages()}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <StrategicGameForm formData={formData} setFormData={setFormData} realms={realms} />
          <TechnicalInfo>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameCreate;
