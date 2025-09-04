import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { fetchFaction } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import CharacterUpdateActions from './CharacterUpdateActions';

const CharacterUpdate = () => {
  const location = useLocation();
  const character = location.state?.character;
  const [faction, setFaction] = useState(null);
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState({
    name: character.name,
    description: character.description,
  });

  const bindFaction = (factionId) => {
    fetchFaction(factionId).then((faction) => setFaction(faction));
  };

  const bindGame = (gameId) => {
    fetchStrategicGame(gameId).then((faction) => setGame(faction));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (character) {
      bindFaction(character.factionId);
      bindGame(character.gameId);
    }
  }, [character]);

  if (!character || !game || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterUpdateActions character={character} formData={formData} game={game} faction={faction} />
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
