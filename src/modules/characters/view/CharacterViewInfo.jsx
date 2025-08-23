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

const CharacterViewInfo = ({ character, faction }) => {
  const { t } = useTranslation();

  return (
    <>
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
          <TextField label={t('faction')} name="faction" value={faction.name} readOnly fullWidth />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h5">
            {t('experience')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <TextField label={t('current-level')} name="currentLevel" value={character.experience.level} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <TextField label={t('available-level')} name="availableLevel" value={character.experience.availableLevel} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <TextField label={t('xp')} name="experience" value={character.experience.xp} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <TextField
            label={t('available-development-points')}
            name="availableDevelopmentPoints"
            value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h5">
            {t('general-info')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <TextField label={t('size')} name="size" value={character.info.sizeId} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <HeightTextField value={character.info.height} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <WeightTextField value={character.info.weight} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <TextField label={t('hit-points')} name="hitPoints" value={character.hp.max} readOnly fullWidth />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h5">
            {t('movement')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <MovementTextField i18nLabel={t('stride-stat-bonus')} value={character.movement.strideQuBonus} />
        </Grid>
        <Grid item size={3}>
          <MovementTextField i18nLabel={t('stride-racial-bonus')} value={character.movement.strideRacialBonus} />
        </Grid>
        <Grid item size={3}>
          <MovementTextField i18nLabel={t('base-movement-rate')} value={character.movement.baseMovementRate} />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h5">
            {t('initiative')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <InitiativeTextField i18nLabel={t('initiative-base-bonus')} value={character.initiative.baseBonus} />
        </Grid>
        <Grid item size={3}>
          <InitiativeTextField i18nLabel={t('initiative-custom-bonus')} value={character.initiative.customBonus} />
        </Grid>
        <Grid item size={3}>
          <InitiativeTextField i18nLabel={t('initiative-total-bonus')} value={character.initiative.totalBonus} />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewInfo;
