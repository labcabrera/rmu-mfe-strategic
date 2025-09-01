/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const CharacterViewStatsEntry = ({ statKey, statName, character: character }) => {
  return (
    <>
      <Grid item size={2}>
        {statName}
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Potential"
          variant="standard"
          name={statKey}
          value={character.statistics[statKey].potential}
          readonly
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Temporary"
          variant="standard"
          name={statKey}
          value={character.statistics[statKey].temporary}
          readonly
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Racial Bonus"
          variant="standard"
          name={statKey}
          value={character.statistics[statKey].racial}
          readonly
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              color: character.statistics[statKey].racial < 0 ? '#ffab91' : character.statistics[statKey].racial > 0 ? '#a5d6a7' : 'white',
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Bonus"
          variant="standard"
          name={statKey}
          readonly
          value={character.statistics[statKey].bonus}
          fullWidth
          sx={{
            '& .MuiInputBase-input': {
              color: character.statistics[statKey].bonus < 0 ? '#ffab91' : character.statistics[statKey].bonus > 0 ? '#a5d6a7' : 'white',
              fontWeight: 'bold',
              textAlign: 'right',
            },
          }}
        />
      </Grid>
      <Grid item size={2}></Grid>
    </>
  );
};

const CharacterViewStats = ({ character }) => {
  const { t } = useTranslation();
  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('stats')}
          </Typography>
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
