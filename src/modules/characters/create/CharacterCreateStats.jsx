/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { getStatBonus } from '../../services/stat-service';
import CharacterCreateStatsActions from './CharacterCreateStatsActions';

const CharacterStats = ({ statKey, statName, formData, setFormData, statBonusFormData }) => {
  const onChangePotential = (e) => {
    const { name, value } = e.target;
    // const intValue = Math.max(1, Math.min(100, parseInt(value)));
    const intValue = parseInt(value);
    setFormData((prevState) => ({
      ...prevState,
      statistics: {
        ...prevState.statistics,
        [name]: {
          ...prevState.statistics[name],
          potential: intValue,
        },
      },
    }));
  };

  const onChangeTemporary = (e) => {
    const { name, value } = e.target;
    // const intValue = Math.max(1, Math.min(100, parseInt(value)));
    const intValue = parseInt(value);
    const potential = formData.statistics[name].potential;
    const newPotential = Math.max(potential, intValue);
    setFormData((prevState) => ({
      ...prevState,
      statistics: {
        ...prevState.statistics,
        [name]: {
          ...prevState.statistics[name],
          temporary: intValue,
          potential: newPotential,
        },
      },
    }));
  };

  return (
    <>
      <Grid item size={2}>
        {statName}
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Potential"
          variant="outlined"
          name={statKey}
          type="number"
          value={formData.statistics[statKey].potential}
          fullWidth
          onChange={onChangePotential}
        />
      </Grid>
      <Grid item size={2}>
        <TextField
          label="Temporary"
          variant="outlined"
          name={statKey}
          type="number"
          value={formData.statistics[statKey].temporary}
          fullWidth
          onChange={onChangeTemporary}
        />
      </Grid>
      <Grid item size={2}>
        <TextField label="Racial Bonus" variant="outlined" name={statKey} value={formData.statistics[statKey].racial} fullWidth />
      </Grid>
      <Grid item size={2}>
        <TextField label="Potential Bonus" variant="outlined" name={statKey} value={statBonusFormData[statKey].potential} fullWidth />
      </Grid>
      <Grid item size={2}>
        <TextField label="Temporary Bonus" variant="outlined" name="ag" value={statBonusFormData[statKey].temporary} readonly />
      </Grid>
    </>
  );
};

const CharacterCreateStats = ({ strategicGame, formData, setFormData }) => {
  const [statBonusFormData, setStatBonusFormData] = useState({
    ag: { potential: 0, temporary: 0 },
    co: { potential: 0, temporary: 0 },
    em: { potential: 0, temporary: 0 },
    in: { potential: 0, temporary: 0 },
    me: { potential: 0, temporary: 0 },
    pr: { potential: 0, temporary: 0 },
    qu: { potential: 0, temporary: 0 },
    re: { potential: 0, temporary: 0 },
    sd: { potential: 0, temporary: 0 },
    st: { potential: 0, temporary: 0 },
  });

  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid size={12}>
          <h3>Stats</h3>
        </Grid>
        <Grid size={6}>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <CharacterStats statKey="ag" statName="ag" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="co" statName="co" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="em" statName="em" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="in" statName="in" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="me" statName="Memory" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="pr" statName="Perception" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="qu" statName="Quickness" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="re" statName="Reasoning" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="sd" statName="sd" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
            <CharacterStats statKey="st" statName="Strength" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
          </Grid>
        </Grid>

        <Grid size={6}>
          <CharacterCreateStatsActions
            strategicGame={strategicGame}
            formData={formData}
            setFormData={setFormData}
            setStatBonusFormData={setStatBonusFormData}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterCreateStats;
