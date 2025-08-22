import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import StrategicGameUpdateActions from './StrategicGameUpdateActions';

const StrategicGameUpdate = () => {
  const location = useLocation();
  const strategicGame = location.state?.strategicGame;
  const [formData, setFormData] = useState({
    name: strategicGame.name,
    description: strategicGame.description,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <StrategicGameUpdateActions formData={formData} />
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField label="Name" fullWidth name="name" value={formData.name} onChange={handleChange} />
        </Grid>
        <Grid size={12}>
          <TextField label="Description" fullWidth name="description" value={formData.description} onChange={handleChange} multiline maxRows={4} />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameUpdate;
