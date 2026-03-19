import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchRealms } from '../../api/realm';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto, CREATE_GAME_TEMPLATE } from '../../api/strategic-game.dto';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { DEFAULT_REALM_IMAGE } from '../../services/image-service';
import EditableAvatar from '../../shared/avatars/EditableAvatar';
import TechnicalInfo from '../../shared/display/TechnicalInfo';
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
    fetchRealms()
      .then((data) => setRealms(data))
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
