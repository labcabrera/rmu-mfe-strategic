/* eslint-disable react/prop-types */
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

import { getStatBonus } from '../../services/stat-service';

const stats = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

const StatButton = ({ text, onClick }) => {
  return (
    <Button variant="outlined" onClick={onClick}>
      {text}
    </Button>
  );
};

const randomStatValue = () => {
  const min = 11;
  const max = 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

const CharacterCreateStatsActions = ({ strategicGame, formData, setFormData, setStatBonusFormData }) => {
  const [boosts, setBoosts] = useState(strategicGame?.powerLevel.statBoosts || 2);
  const [swaps, setSwaps] = useState(strategicGame?.powerLevel.statSwaps || 2);
  const [sourceBoostStat, setSourceBoostStat] = useState('');
  const [targetBoostStat, setTargetBoostStat] = useState('');
  const [replaceBoostStat, setReplaceBoostStat] = useState('');

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
      setBoosts(strategicGame?.powerLevel.statBoosts || 2);
      setSwaps(strategicGame?.powerLevel.statSwaps || 2);
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
      setSwaps(swaps - 1);
    }
  };

  const handleReplacePotential = () => {
    const potentialValue = strategicGame?.powerLevel.statBoostPotential || 78;
    const temporaryValue = strategicGame?.powerLevel.statBoostTemporary || 56;
    if (boosts > 0 && replaceBoostStat) {
      setFormData((prevState) => {
        const targetStat = prevState.statistics[replaceBoostStat];
        return {
          ...prevState,
          statistics: {
            ...prevState.statistics,
            [replaceBoostStat]: {
              ...targetStat,
              potential: potentialValue,
              temporary: temporaryValue,
            },
          },
        };
      });
      setStatBonusFormData((prevState) => {
        return {
          ...prevState,
          [replaceBoostStat]: {
            ...prevState[replaceBoostStat],
            potential: getStatBonus(potentialValue),
            temporary: getStatBonus(temporaryValue),
          },
        };
      });
      setBoosts(boosts - 1);
    }
  };

  const handleBoostHighest = () => {
    if (boosts > 0) {
      setFormData((prevState) => {
        const highestStat = Object.keys(prevState.statistics).reduce((a, b) =>
          prevState.statistics[a].potential > prevState.statistics[b].potential ? a : b
        );
        return {
          ...prevState,
          statistics: {
            ...prevState.statistics,
            [highestStat]: {
              ...prevState.statistics[highestStat],
              potential: prevState.statistics[highestStat].potential + 1,
            },
          },
        };
      });
      setStatBonusFormData((prevState) => {
        const highestStat = Object.keys(prevState).reduce((a, b) => (prevState[a].potential > prevState[b].potential ? a : b));
        return {
          ...prevState,
          [highestStat]: {
            ...prevState[highestStat],
            potential: getStatBonus(prevState[highestStat].potential + 1),
          },
        };
      });
      setBoosts(boosts - 1);
    }
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      <Grid size={2}>
        <StatButton text="Random" onClick={handleRandomStats} />
      </Grid>
      <Grid size={2}>
        <TextField label="Boost Amount" value={boosts} readOnly fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="Swap Amount" value={swaps} readOnly fullWidth />
      </Grid>
      <Grid size={6}></Grid>
      <Grid size={2}>
        <StatButton text="Swap" onClick={handleSwapStats} />
      </Grid>
      <Grid size={2}>
        <StatSelect name="Source" value={sourceBoostStat} setValue={setSourceBoostStat} />
      </Grid>
      <Grid size={2}>
        <StatSelect name="Target" value={targetBoostStat} setValue={setTargetBoostStat} />
      </Grid>
      <Grid size={6}>Swap statistics</Grid>
      <Grid size={2}>
        <StatButton text="Replace" onClick={handleReplacePotential} />
      </Grid>
      <Grid size={2}>
        <StatSelect name="Target" value={replaceBoostStat} setValue={setReplaceBoostStat} />
      </Grid>
      <Grid size={2}></Grid>
      <Grid size={6}>Replace potential stat with 78 and temporary stat with 56.</Grid>
      <Grid size={2}>
        <StatButton text="Replace" onClick={handleBoostHighest} />
      </Grid>
      <Grid size={4}></Grid>
      <Grid size={6}>Replace your highest temporary stat with 90 and boost its potential by 10.</Grid>
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
      <Grid size={1}></Grid>{' '}
    </Grid>
  );
};

export default CharacterCreateStatsActions;
