import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchRealms } from '../../api/realm';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto, gameCreateTemplate } from '../../api/strategic-game.dto';
import { defaultStrategicGameImage } from '../../services/image-service';
import GenericAvatar from '../../shared/avatars/GenericAvatar';
import StrategicGameCreateActions from './StrategicGameCreateActions';
import StrategicGameCreateAttributes from './StrategicGameCreateAttributes';
import StrategicGameCreateAttributesBasic from './StrategicGameCreateAttributesBasic';

const StrategicGameCreate: FC = () => {
  const [realms, setRealms] = useState<Realm[]>([]);
  const { showError } = useError();
  const [formData, setFormData] = useState<CreateStrategicGameDto>(gameCreateTemplate);
  const [isValid, setIsValid] = useState<boolean>(false);

  const bindRealms = async () => {
    fetchRealms()
      .then((data) => {
        setRealms(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('Unknown error');
      });
  };

  const validateForm = () => {
    return !!formData.name && !!formData.realmId;
  };

  useEffect(() => {
    setIsValid(validateForm());
  }, [formData]);

  useEffect(() => {
    bindRealms();
  }, []);

  return (
    <>
      <StrategicGameCreateActions formData={formData} isValid={isValid} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <GenericAvatar imageUrl={defaultStrategicGameImage} size={300} />
          <StrategicGameCreateAttributesBasic formData={formData} setFormData={setFormData} realms={realms} />
        </Grid>
        <Grid size={7}>
          <StrategicGameCreateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default StrategicGameCreate;
