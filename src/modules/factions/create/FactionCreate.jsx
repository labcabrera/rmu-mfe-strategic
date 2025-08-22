import React, { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import TextField from '@mui/material/TextField';

import FactionCreateActions from './FactionCreateActions';

const FactionCreate = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [strategicGame] = useState(location.state?.strategicGame || null);
  const [formData, setFormData] = useState({
    gameId: gameId,
    name: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <FactionCreateActions formData={formData} strategicGame={strategicGame} />
      <TextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth/>
      <TextField label="Description" variant="outlined" name="description" value={formData.description} onChange={handleChange} fullWidth/>
      Faction creation for game ID: {gameId}
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>SGame: {JSON.stringify(strategicGame, null, 2)}</pre>
    </>
  );
};

export default FactionCreate;
