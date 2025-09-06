import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import FactionUpdateActions from './FactionUpdateActions';
import FactionUpdateAttributes from './FactionUpdateAttributes';

const FactionUpdate = () => {
  const location = useLocation();
  const faction = location.state?.faction;
  const game = location.state?.game;
  const [formData, setFormData] = useState({
    name: faction.name,
    description: faction.description,
    availableGold: faction.factionManagement?.availableGold,
    availableXP: faction.factionManagement?.availableXP,
  });

  return (
    <>
      <FactionUpdateActions formData={formData} game={game} faction={faction} />
      <FactionUpdateAttributes formData={formData} setFormData={setFormData} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default FactionUpdate;
