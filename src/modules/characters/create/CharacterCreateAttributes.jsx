/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React from 'react';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import HeightTextField from '../../shared/input/HeightTextField';
import InitiativeTextField from '../../shared/input/InitiativeTextField';
import MovementTextField from '../../shared/input/MovementTextField';
import NameTextField from '../../shared/input/NameTextField';
import WeightTextField from '../../shared/input/WeightTextField';
import SelectFaction from '../../shared/selects/SelectFaction';
import SelectLevel from '../../shared/selects/SelectLevel';
import SelectRace from '../../shared/selects/SelectRace';

const CharacterCreateAttributes = ({ formData, setFormData }) => {
  const { t, i18n } = useTranslation();

  const onRaceChange = (raceId, raceInfo) => {
    if (raceInfo) {
      const stats = { ...formData.statistics };
      const keys = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];
      keys.forEach((key) => {
        stats[key].racial = raceInfo.defaultStatBonus[key];
        const totalBonus = stats[key].custom + stats[key].racial + stats[key].custom;
        stats[key].totalBonus = totalBonus;
      });
      setFormData((prevState) => ({
        ...prevState,
        info: {
          ...prevState.info,
          race: raceId,
          sizeId: raceInfo.size,
          height: raceInfo.averageHeight.male,
          weight: raceInfo.averageWeight.male,
        },
        movement: {
          ...prevState.movement,
          strideRacialBonus: raceInfo.strideBonus,
        },
        statistics: stats,
      }));
    }
  };

  const onLevelChange = (level) => {
    updateFormData('info', 'level', level);
  };

  const onFactionChange = (faction) => {
    console.log('Selected faction:', faction);
    setFormData({ ...formData, factionId: faction });
  };

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    } catch (error) {
      console.log('handleChange error ' + error);
    }
  };

  const handleInitiativeCustomBonusChange = (e) => updateFormData('initiative', 'customBonus', e.target.value ? parseInt(e.target.value) : 0);
  const handleStrideBonusChange = (e) => updateFormData('movement', 'strideBonus', e.target.value ? parseInt(e.target.value) : 0);
  const handleHeightChange = (e) => updateFormData('info', 'height', e.target.value ? parseInt(e.target.value) : 0);
  const handleWeightChange = (e) => updateFormData('info', 'weight', e.target.value ? parseInt(e.target.value) : 0);

  const updateFormData = (field1, field2, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field1]: {
        ...prevState[field1],
        [field2]: value,
      },
    }));
  };

  return (
    <div className="tactical-game-character-creation-attributes">
      <Grid container spacing={2}>
        <Grid item size={4}>
          <SelectRace value={formData.info.race} onChange={onRaceChange} />
        </Grid>
        <Grid item size={4}>
          <NameTextField value={formData.name} onChange={handleChange} generateRandom={true} generateRandomRaceValue={formData.info.race} />
        </Grid>
        <Grid item size={4}>
          <SelectFaction value={formData.faction} onChange={onFactionChange} />
        </Grid>
        <Grid item size={4}>
          <SelectLevel value={formData.info.level} onChange={onLevelChange} />
        </Grid>
        <Grid item size={4}>
          <HeightTextField value={formData.info.height} onChange={handleHeightChange} />
        </Grid>
        <Grid item size={4}>
          <WeightTextField value={formData.info.weight} onChange={handleWeightChange} />
        </Grid>
        <Grid item size={4}>
          <MovementTextField i18nLabel="stride-custom-bonus" value={formData.movement.strideCustomBonus} onChange={handleStrideBonusChange} />
        </Grid>
        <Grid item size={4}>
          <MovementTextField i18nLabel="stride-racial-bonus" value={formData.movement.strideRacialBonus} disabled />
        </Grid>
        <Grid item size={4}>
          <InitiativeTextField value={formData.initiative.customBonus} onChange={handleInitiativeCustomBonusChange} />
        </Grid>
        <Grid item size={12}>
          <TextField
            label="Description"
            variant="outlined"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            maxRows={4}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default CharacterCreateAttributes;
