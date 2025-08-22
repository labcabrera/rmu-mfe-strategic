/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';

import { getStatBonus } from '../../services/stat-service';

const stats = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

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
      <Grid item size={1}>
        {statName}
      </Grid>
      <Grid item size={1}>
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
      <Grid item size={1}>
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
      <Grid item size={1}>
        <TextField label="Racial Bonus" variant="outlined" name={statKey} value={formData.statistics[statKey].racial} fullWidth />
      </Grid>
      <Grid item size={1}>
        <TextField label="Potential Bonus" variant="outlined" name={statKey} value={statBonusFormData[statKey].potential} fullWidth />
      </Grid>
      <Grid item size={1}>
        <TextField label="Temporary Bonus" variant="outlined" name="ag" value={statBonusFormData[statKey].temporary} readonly />
      </Grid>
      <Grid item size={6}></Grid>
    </>
  );
};

const StatButton = ({ text, onClick }) => {
  return (
    <Button variant="outlined" onClick={onClick}>
      {text}
    </Button>
  );
};

const StatSelect = ({ name, value, setValue }) => {
  const handleChange = (e) => {
    const { value } = e.target;
    setValue(value);
  };

  return (
    <TextField select label={name} id={`select-${name}`} value={value} variant="outlined" fullWidth onChange={handleChange}>
      {stats.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

const CharacterCreateStats = ({ formData, setFormData }) => {
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
  const [boosts, setBoosts] = useState(2);
  const [sourceBoostStat, setSourceBoostStat] = useState('');
  const [targetBoostStat, setTargetBoostStat] = useState('');

  const randomStatValue = () => {
    const min = 11;
    const max = 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const handleRandomStats = () => {
    for (const key of stats) {
      const values = [randomStatValue(), randomStatValue(), randomStatValue()];
      values.sort((a, b) => b - a);
      console.log(values);
      const potentialValue = values[0];
      const temporaryValue = values[1];
      const potentialBonus = getStatBonus(potentialValue);
      const temporaryBonus = getStatBonus(temporaryValue);
      setFormData((prevState) => ({
        ...prevState,
        statistics: {
          ...prevState.statistics,
          [key]: {
            ...prevState.statistics[key],
            potential: potentialValue,
            temporary: temporaryValue,
          },
        },
      }));
      setStatBonusFormData((prevState) => ({
        ...prevState,
        [key]: {
          potential: potentialBonus,
          temporary: temporaryBonus,
        },
      }));
      setBoosts(2);
    }
  };

  const handleSwapStats = () => {
    if (boosts > 0 && sourceBoostStat && targetBoostStat) {
      setFormData((prevState) => {
        const sourceStat = prevState.statistics[sourceBoostStat];
        const targetStat = prevState.statistics[targetBoostStat];
        return {
          ...prevState,
          statistics: {
            ...prevState.statistics,
            [sourceBoostStat]: {
              ...sourceStat,
              potential: targetStat.potential,
              temporary: targetStat.temporary,
            },
            [targetBoostStat]: {
              ...targetStat,
              potential: sourceStat.potential,
              temporary: sourceStat.temporary,
            },
          },
        };
      });
      setStatBonusFormData((prevState) => {
        const sourceBonus = prevState[sourceBoostStat];
        const targetBonus = prevState[targetBoostStat];
        return {
          ...prevState,
          [sourceBoostStat]: {
            ...sourceBonus,
            potential: targetBonus.potential,
            temporary: targetBonus.temporary,
          },
          [targetBoostStat]: {
            ...targetBonus,
            potential: sourceBonus.potential,
            temporary: sourceBonus.temporary,
          },
        };
      });
      setBoosts(boosts - 1);
    }
  };

  const handleReplacePotential = () => {
    if (boosts > 0 && targetBoostStat) {
      setFormData((prevState) => {
        const targetStat = prevState.statistics[targetBoostStat];
        return {
          ...prevState,
          statistics: {
            ...prevState.statistics,
            [targetBoostStat]: {
              ...targetStat,
              potential: 78,
            },
          },
        };
      });
      setBoosts(boosts - 1);
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <CharacterStats statKey="ag" statName="Agility" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="co" statName="Constitution" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="em" statName="Empathy" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="in" statName="Intelligence" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="me" statName="Memory" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="pr" statName="Perception" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="qu" statName="Quickness" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="re" statName="Reasoning" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="sd" statName="Self discipline" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />
        <CharacterStats statKey="st" statName="Strength" formData={formData} setFormData={setFormData} statBonusFormData={statBonusFormData} />

        <Grid size={1}></Grid>
        <Grid size={1}>
          <StatButton text="Random" onClick={handleRandomStats} />
        </Grid>
        <Grid size={1}>Boost count: {boosts}</Grid>
        <Grid size={9}></Grid>

        <Grid size={1}></Grid>
        <Grid size={1}>
          <StatButton text="Swap" onClick={handleSwapStats} />
        </Grid>
        <Grid size={1}>
          <StatSelect name="Source" value={sourceBoostStat} setValue={setSourceBoostStat} />
        </Grid>
        <Grid size={1}>
          <StatSelect name="Target" value={targetBoostStat} setValue={setTargetBoostStat} />
        </Grid>
        <Grid size={8}>Swap statistics</Grid>

        <Grid size={1}></Grid>
        <Grid size={1}>
          <StatButton text="Replace" onClick={handleReplacePotential} />
        </Grid>
        <Grid size={1}>
          <StatSelect name="Target" value={targetBoostStat} setValue={setTargetBoostStat} />
        </Grid>
        <Grid size={8}>Replace potential stat with 78 and temporary stat with 56.</Grid>
        <Grid size={1}></Grid>

        <Grid size={1}></Grid>
        <Grid size={1}>
          <StatButton text="Replace" onClick={handleReplacePotential} />
        </Grid>
        <Grid size={1}></Grid>
        <Grid size={8}>Replace your highest temporary stat with 90 and boost its potential by 10.</Grid>
        <Grid size={1}></Grid>

        <Grid size={1}></Grid>
        <Grid size={1}>
          <StatButton text="Replace" onClick={handleReplacePotential} />
        </Grid>
        <Grid size={1}></Grid>
        <Grid size={8}>Replace your second-highest temporary stat with 85 and boost its potential by 10..</Grid>
        <Grid size={1}></Grid>

        <Grid size={1}></Grid>
        <Grid size={1}>
          <StatButton text="Replace" onClick={handleReplacePotential} />
        </Grid>
        <Grid size={1}></Grid>
        <Grid size={8}>Replace your second-highest temporary stat with 85 and boost its potential by 10..</Grid>
        <Grid size={1}></Grid>
      </Grid>
      <pre>sourceBoostStat: {JSON.stringify(sourceBoostStat, null, 2)}</pre>
      <pre>targetBoostStat: {JSON.stringify(targetBoostStat, null, 2)}</pre>
    </>
  );
};

export default CharacterCreateStats;
