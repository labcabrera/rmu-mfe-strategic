/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import SouthIcon from '@mui/icons-material/South';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PenaltyTextField from '../../shared/inputs/PenaltyTextField';
import WeightTextField from '../../shared/inputs/WeightTextField';

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
        <WeightTextField value={character.equipment.weight} readOnly />
      </Grid>
      <Grid size={6}></Grid>
      <Grid size={6}>
        <PenaltyTextField value={character.equipment.maneuverPenalty} i18nLabel="maneuver-penalty" readOnly />
      </Grid>
      <Grid size={6}>
        <PenaltyTextField value={character.equipment.baseManeuverPenalty} i18nLabel="base-maneuver-penalty" readOnly />
      </Grid>
      <Grid size={6}>
        <PenaltyTextField value={character.equipment.rangedPenalty} i18nLabel="ranged-penalty" readOnly />
      </Grid>
      <Grid size={6}>
        <PenaltyTextField value={character.equipment.perceptionPenalty} i18nLabel="perception-penalty" readOnly />
      </Grid>
      <Grid size={6}>
        <TextField
          label={t('movement-base-difficulty')}
          variant="standard"
          name="movement-base-difficulty"
          value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
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
