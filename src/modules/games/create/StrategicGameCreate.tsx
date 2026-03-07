import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchRealms } from '../../api/realm';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto, gameCreateTemplate } from '../../api/strategic-game.dto';
import EditableAvatar from '../../shared/avatars/EditableAvatar';
import TechnicalInfo from '../../shared/display/TechnicalInfo';
import StrategicGameCreateActions from './StrategicGameCreateActions';
import StrategicGameCreateAttributes from './StrategicGameCreateAttributes';

const StrategicGameCreate: FC = () => {
  const { showError } = useError();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [formData, setFormData] = useState<CreateStrategicGameDto>(gameCreateTemplate);
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
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, md: 2 }}>
          <EditableAvatar
            imageUrl={formData.imageUrl || ''}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <StrategicGameCreateAttributes formData={formData} setFormData={setFormData} realms={realms} />
          <TechnicalInfo>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameCreate;
