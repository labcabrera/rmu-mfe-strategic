/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CharacterViewInfo from './CharacterViewInfo';
import CharacterViewStats from './CharacterViewStats';

const CharacterViewAttributes = ({ character, faction, strategicGame }) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container spacing={10}>
        <Grid item size={6}>
          <CharacterViewInfo character={character} faction={faction} strategicGame={strategicGame} />
        </Grid>
        <Grid item size={6}>
          <CharacterViewStats character={character} />
        </Grid>
      </Grid>
      <Grid item size={6}>
        <TextField label={t('description')} variant="standard" name="description" value={character.description} fullWidth multiline maxRows={4} />
      </Grid>
    </>
  );
};

export default CharacterViewAttributes;
