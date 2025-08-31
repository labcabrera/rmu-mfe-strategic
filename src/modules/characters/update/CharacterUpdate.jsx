import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CharacterUpdateActions from './CharacterUpdateActions';

const CharacterUpdate = () => {
  const location = useLocation();
  const character = location.state?.character;
  const [formData, setFormData] = useState({
    name: character.name,
    description: character.description,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <CharacterUpdateActions character={character} formData={formData} />
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField label="Name" fullWidth name="name" value={formData.name} onChange={handleChange} />
        </Grid>
        <Grid size={12}>
          <TextField label="Description" fullWidth name="description" value={formData.description} onChange={handleChange} multiline maxRows={4} />
        </Grid>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default CharacterUpdate;
