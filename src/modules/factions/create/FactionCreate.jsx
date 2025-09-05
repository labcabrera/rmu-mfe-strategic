import React, { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import FactionCreateActions from './FactionCreateActions';
import FactionCreateAttributes from './FactionCreateAttributes';

const FactionCreate = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [strategicGame] = useState(location.state?.strategicGame || null);
  const [formData, setFormData] = useState({
    gameId: gameId,
    name: '',
    description: '',
    availableGold: '100',
    availableXP: '200000',
  });

  return (
    <>
      <FactionCreateActions formData={formData} strategicGame={strategicGame} />
      <FactionCreateAttributes formData={formData} setFormData={setFormData} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default FactionCreate;
