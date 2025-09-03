/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const CharacterViewEquipmentInfo = ({ character }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('equipment-info')}
        </Typography>
      </Grid>
      <Grid size={6}>
        <TextField label={t('weight')} variant="standard" name="weight" value={character.equipment.weight} fullWidth />
      </Grid>
      <Grid size={6}>
        <TextField label={t('maneuver-penalty')} variant="standard" name="maneuver-penalty" value={character.equipment.maneuverPenalty} fullWidth />
      </Grid>
      <Grid size={6}>
        <TextField label={t('ranged-penalty')} variant="standard" name="ranged-penalty" value={character.equipment.rangedPenalty} fullWidth />
      </Grid>
      <Grid size={6}>
        <TextField
          label={t('perception-penalty')}
          variant="standard"
          name="perception-penalty"
          value={character.equipment.perceptionPenalty}
          fullWidth
        />
      </Grid>
      <Grid size={6}>
        <TextField
          label={t('movement-base-difficulty')}
          variant="standard"
          name="movement-base-difficulty"
          value={character.equipment.movementBaseDifficulty || ''}
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('armor')}
        </Typography>
      </Grid>
      {character.defense.armor.at ? (
        <Grid size={6}>
          <TextField label={t('at')} variant="standard" name="at" value={character.defense.armor.at} fullWidth />
        </Grid>
      ) : (
        <>
          <Grid size={6}>
            <TextField label={t('body-at')} variant="standard" name="body-at" value={character.defense.armor.bodyAt} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label={t('head-at')} variant="standard" name="head-at" value={character.defense.armor.headAt} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label={t('arms-at')} variant="standard" name="arms-at" value={character.defense.armor.armsAt} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label={t('legs-at')} variant="standard" name="legs-at" value={character.defense.armor.legsAt} fullWidth />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default CharacterViewEquipmentInfo;
