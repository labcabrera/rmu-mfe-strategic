import React, { useEffect, useState } from 'react';
import { useError } from '../../../ErrorContext';
import { fetchRealms } from '../../api/realms';
import { gameCreateTemplate } from '../../data/game-create';
import StrategicGameCreateActions from './StrategicGameCreateActions';
import StrategicGameCreateAttributes from './StrategicGameCreateAttributes';

const StrategicGameCreate = () => {
  const [realms, setRealms] = useState([]);
  const { showError } = useError();
  const [formData, setFormData] = useState(gameCreateTemplate);

  const bindRealms = async () => {
    try {
      const data = await fetchRealms();
      setRealms(data.content.map(mapRealm));
    } catch (err) {
      showError(err.message);
    }
  };

  const mapRealm = (realm) => {
    return {
      value: realm.id,
      label: realm.name,
    };
  };

  useEffect(() => {
    bindRealms();
  }, []);

  return (
    <>
      <StrategicGameCreateActions formData={formData} />
      <StrategicGameCreateAttributes formData={formData} setFormData={setFormData} realms={realms} />
    </>
  );
};

export default StrategicGameCreate;
