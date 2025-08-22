/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HeightTextField from '../../shared/input/HeightTextField';
import InitiativeTextField from '../../shared/input/InitiativeTextField';
import MovementTextField from '../../shared/input/MovementTextField';
import WeightTextField from '../../shared/input/WeightTextField';
import CharacterViewSkills from './CharacterViewSkills';
import CharacterViewStats from './CharacterViewStats';

const CharacterViewAttributes = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography color="secondary" variant="h4">
          {t('information')}
        </Typography>
      </Grid>
      <Grid item size={3}>
        <TextField label={t('name')} name="name" value={character.name} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label={t('race')} name="race" value={t(character.info.race)} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label={t('profession')} name="profession" value={t(character.info.professionId)} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label={t('faction')} name="faction" value={character.factionId} readOnly fullWidth />
      </Grid>
      <Grid size={12}>
        <h3>Experience</h3>
      </Grid>
      <Grid item size={3}>
        <TextField label="Current level" name="currentLevel" value={character.experience.level} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label="Available level" name="availableLevel" value={character.experience.availableLevel} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label="XP" name="experience" value={character.experience.xp} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField
          label="Available Development Points"
          name="availableDevelopmentPoints"
          value={character.experience.availableDevelopmentPoints}
          readOnly
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <h3>Info</h3>
      </Grid>
      <Grid item size={3}>
        <TextField label="size" name="size" value={character.info.sizeId} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label="Base movement rate" name="baseMovementRate" value={character.movement.baseMovementRate} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <HeightTextField value={character.info.height} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <WeightTextField value={character.info.weight} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <TextField label="Hit points" name="hitPoints" value={character.hp.max} readOnly fullWidth />
      </Grid>
      <Grid item size={3}>
        <MovementTextField i18nLabel="stride-custom-bonus" value={character.movement.strideCustomBonus} />
      </Grid>
      <Grid item size={3}>
        <MovementTextField i18nLabel="stride-racial-bonus" value={character.movement.strideRacialBonus} />
      </Grid>
      <Grid item size={3}>
        <InitiativeTextField i18nLabel="initiative" value={character.initiative.totalBonus} />
      </Grid>
      <Grid item size={3}>
        <InitiativeTextField i18nLabel="initiative" value={character.initiative.totalBonus} />
      </Grid>
      <Grid item size={12}>
        <Grid container spacing={2}>
          <Grid item size={4}>
            <CharacterViewStats character={character} />
          </Grid>
          <Grid item size={8}>
            <CharacterViewSkills character={character} setCharacter={setCharacter} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item size={12}>
        <TextField label="Description" variant="outlined" name="description" value={character.description} fullWidth multiline maxRows={4} />
      </Grid>
    </Grid>
  );
};

export default CharacterViewAttributes;
