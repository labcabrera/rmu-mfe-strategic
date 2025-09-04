/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';
import DefenseTextField from '../../shared/inputs/DefenseTextField';
import HeightTextField from '../../shared/inputs/HeightTextField';
import HpTextField from '../../shared/inputs/HpTextField';
import InitiativeTextField from '../../shared/inputs/InitiativeTextField';
import MovementTextField from '../../shared/inputs/MovementTextField';
import WeightTextField from '../../shared/inputs/WeightTextField';

const CharacterViewInfo = ({ character, strategicGame, faction }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenGame = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`);
  };

  const handleOpenFaction = () => {
    navigate(`/strategic/factions/view/${faction.id}`);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CharacterAvatar character={character} size={120} />
          <Typography variant="h6">{character.name}</Typography>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('information')}
          </Typography>
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('game')}
            variant="standard"
            fullWidth
            value={strategicGame?.name || ''}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={handleOpenGame}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('faction')}
            variant="standard"
            fullWidth
            value={faction?.name || ''}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={handleOpenFaction}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid item size={3}>
          <TextField label={t('race')} name="race" value={t(character.info.raceId)} variant="standard" readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <TextField label={t('profession')} name="profession" value={t(character.info.professionId)} variant="standard" readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <TextField label={t('realm')} name="realm" value={t(character.info.realmType)} variant="standard" readOnly fullWidth />
        </Grid>

        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('experience')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <TextField
            label={t('current-level')}
            name="currentLevel"
            value={character.experience.level}
            readOnly
            fullWidth
            variant="standard"
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={3}>
          <TextField
            label={t('available-level')}
            name="availableLevel"
            value={character.experience.availableLevel}
            readOnly
            fullWidth
            variant="standard"
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={3}>
          <TextField
            label={t('xp')}
            name="experience"
            value={new Intl.NumberFormat('en-EN').format(character.experience.xp)}
            readOnly
            fullWidth
            variant="standard"
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={3}>
          <TextField
            label={t('development-points')}
            name="developmentPoints"
            value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
            readOnly
            fullWidth
            variant="standard"
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('general-info')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <TextField label={t('size')} name="size" value={t(`size-${character.info.sizeId}`)} readOnly variant="standard" fullWidth />
        </Grid>
        <Grid item size={3}>
          <HeightTextField value={character.info.height} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <WeightTextField value={character.info.weight} readOnly fullWidth />
        </Grid>
        <Grid item size={3}>
          <HpTextField value={character.hp.current} readOnly fullWidth />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('defense')}
          </Typography>
        </Grid>
        <Grid item size={3}>
          <DefenseTextField i18nLabel={'armor-type'} value={character.defense.armorType} readOnly />
        </Grid>
        <Grid item size={3}>
          <DefenseTextField i18nLabel={'defensive-bonus'} value={character.defense.defensiveBonus} readOnly />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
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
          <Typography color="secondary" variant="h6">
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
