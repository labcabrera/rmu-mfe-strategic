/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

const CharacterViewStatsEntry = ({ statKey, statName, character: character }) => {
  return (
    <>
      <Grid item size={2}>
        {statName}
      </Grid>
      <Grid item size={2}>
        <TextField label="Potential" variant="outlined" name={statKey} readonly value={character.statistics[statKey].potential} fullWidth />
      </Grid>
      <Grid item size={2}>
        <TextField label="Temporary" variant="outlined" name={statKey} readonly value={character.statistics[statKey].temporary} fullWidth />
      </Grid>
      <Grid item size={2}>
        <TextField label="Racial Bonus" variant="outlined" name={statKey} readonly value={character.statistics[statKey].racial} fullWidth />
      </Grid>
      <Grid item size={2}>
        <TextField label="Bonus" variant="outlined" name={statKey} readonly value={character.statistics[statKey].bonus} fullWidth />
      </Grid>
      <Grid item size={2}></Grid>
    </>
  );
};

const CharacterViewStats = ({ character }) => {
  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid size={12}>
          <h3>Stats</h3>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <CharacterViewStatsEntry statKey="ag" statName="ag" character={character} />
            <CharacterViewStatsEntry statKey="co" statName="co" character={character} />
            <CharacterViewStatsEntry statKey="em" statName="em" character={character} />
            <CharacterViewStatsEntry statKey="in" statName="in" character={character} />
            <CharacterViewStatsEntry statKey="me" statName="me" character={character} />
            <CharacterViewStatsEntry statKey="pr" statName="pr" character={character} />
            <CharacterViewStatsEntry statKey="qu" statName="qu" character={character} />
            <CharacterViewStatsEntry statKey="re" statName="re" character={character} />
            <CharacterViewStatsEntry statKey="sd" statName="sd" character={character} />
            <CharacterViewStatsEntry statKey="st" statName="st" character={character} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewStats;
