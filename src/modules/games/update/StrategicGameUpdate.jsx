import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import StrategicGameUpdateActions from './StrategicGameUpdateActions';
import StrategicGameUpdateAttributes from './StrategicGameUpdateAttributes';

const StrategicGameUpdate = () => {
  const location = useLocation();
  const strategicGame = location.state?.strategicGame;
  const [formData, setFormData] = useState({
    name: strategicGame.name,
    description: strategicGame.description,
    options: strategicGame.options,
    powerLevel: strategicGame.powerLevel,
  });

  return (
    <>
      <StrategicGameUpdateActions formData={formData} />
      <StrategicGameUpdateAttributes formData={formData} setFormData={setFormData} />
    </>
  );
};

export default StrategicGameUpdate;
