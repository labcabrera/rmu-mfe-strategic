import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FactionUpdateActions from './FactionUpdateActions';
import FactionUpdateAttributes from './FactionUpdateAttributes';

const FactionUpdate = () => {
  const location = useLocation();
  const faction = location.state?.faction;
  const [formData, setFormData] = useState({
    name: faction.name,
    description: faction.description,
  });

  return (
    <>
      <FactionUpdateActions formData={formData} faction={faction} />
      <FactionUpdateAttributes formData={formData} setFormData={setFormData} />
    </>
  );
};

export default FactionUpdate;
