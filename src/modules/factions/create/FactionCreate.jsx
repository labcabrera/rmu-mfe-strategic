import React, { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
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
      <Grid container spacing={2}>
        <Grid size={4}>
          <TextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={4}>
          <TextField
            label="Available gold"
            variant="outlined"
            name="availableGold"
            value={formData.availableGold}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        </Grid>
        <Grid size={8}></Grid>
        <Grid size={4}>
          <TextField
            label="Available XP"
            variant="outlined"
            name="availableXP"
            value={formData.availableXP}
            onChange={handleChange}
            type="number"
            fullWidth
            slotProps={{ step: 1 }}
          />
        </Grid>
        <Grid size={12}>
          <TextField label="Description" variant="outlined" name="description" value={formData.description} onChange={handleChange} fullWidth />
        </Grid>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default FactionCreate;
