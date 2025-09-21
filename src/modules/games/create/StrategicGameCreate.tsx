import React, { FC, useEffect, useState } from 'react';
import { useError } from '../../../ErrorContext';
import { fetchRealms } from '../../api/realm';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto, gameCreateTemplate } from '../../api/strategic-game.dto';
import StrategicGameCreateActions from './StrategicGameCreateActions';
import StrategicGameCreateAttributes from './StrategicGameCreateAttributes';

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
      <StrategicGameCreateAttributes formData={formData} setFormData={setFormData} realms={realms} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default StrategicGameCreate;
