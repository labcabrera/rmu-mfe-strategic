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

const CharacterViewAttributes = ({ formData: character }) => {
  return (
    <Grid container spacing={2}>
      <Grid item size={4}>
        <TextField label="Name" name="name" value={character.name} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Race" name="race" value={character.info.race} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Profession" name="profession" value={character.info.professionId} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Faction" name="faction" value={character.factionId} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Current level" name="currentLevel" value={character.experience.level} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Available level" name="availableLevel" value={character.experience.availableLevel} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="experience" name="experience" value={character.experience.xp} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="size" name="size" value={character.info.sizeId} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Base movement rate" name="baseMovementRate" value={character.movement.baseMovementRate} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <HeightTextField value={character.info.height} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <WeightTextField value={character.info.weight} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <TextField label="Hit points" name="hitPoints" value={character.hp.max} readOnly fullWidth />
      </Grid>
      <Grid item size={4}>
        <MovementTextField i18nLabel="stride-custom-bonus" value={character.movement.strideCustomBonus} />
      </Grid>
      <Grid item size={4}>
        <MovementTextField i18nLabel="stride-racial-bonus" value={character.movement.strideRacialBonus} />
      </Grid>
      <Grid item size={4}>
        <InitiativeTextField value={character.initiative.customBonus} />
      </Grid>
      <Grid item size={12}>
        <TextField label="Description" variant="outlined" name="description" value={character.description} fullWidth multiline maxRows={4} />
      </Grid>
    </Grid>
  );
};

export default CharacterViewAttributes;
