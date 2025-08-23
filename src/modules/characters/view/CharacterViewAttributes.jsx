/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CharacterViewInfo from './CharacterViewInfo';
import CharacterViewSkills from './CharacterViewSkills';
import CharacterViewStats from './CharacterViewStats';

const CharacterViewAttributes = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  return (
    <>
      <CharacterViewInfo character={character} />
      <Grid container spacing={2}>
        <Grid item size={4}>
          <CharacterViewStats character={character} />
        </Grid>
      </Grid>
      <CharacterViewSkills character={character} setCharacter={setCharacter} />
      <Grid container spacing={2}>
        <Grid item size={12}>
          <TextField label={t('lore')} variant="outlined" name="description" value={character.description} fullWidth multiline maxRows={4} />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewAttributes;
