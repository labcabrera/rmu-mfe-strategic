import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField, Typography } from '@mui/material';
import { Character } from '../../api/character.dto';
import PenaltyTextField from '../../shared/inputs/PenaltyTextField';

interface CharacterViewEquipmentInfoProps {
  character: Character;
}

const CharacterViewEquipmentInfo: React.FC<CharacterViewEquipmentInfoProps> = ({ character }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('equipment-info')}
        </Typography>
      </Grid>
      <Grid size={6}>
        <TextField value={character.equipment.weight} variant="standard" fullWidth />
      </Grid>
      <Grid size={6}></Grid>
      <Grid size={6}>
        <PenaltyTextField
          value={character.equipment.maneuverPenalty}
          i18nLabel="maneuver-penalty"
          onChange={undefined}
        />
      </Grid>
      <Grid size={6}>
        <PenaltyTextField
          value={character.equipment.baseManeuverPenalty}
          i18nLabel="base-maneuver-penalty"
          onChange={undefined}
        />
      </Grid>
      <Grid size={6}>
        <PenaltyTextField value={character.equipment.rangedPenalty} i18nLabel="ranged-penalty" onChange={undefined} />
      </Grid>
      <Grid size={6}>
        <PenaltyTextField
          value={character.equipment.perceptionPenalty}
          i18nLabel="perception-penalty"
          onChange={undefined}
        />
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
            <TextField
              label={t('body-at')}
              variant="standard"
              name="body-at"
              value={character.defense.armor.bodyAt}
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={t('head-at')}
              variant="standard"
              name="head-at"
              value={character.defense.armor.headAt}
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={t('arms-at')}
              variant="standard"
              name="arms-at"
              value={character.defense.armor.armsAt}
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={t('legs-at')}
              variant="standard"
              name="legs-at"
              value={character.defense.armor.legsAt}
              fullWidth
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default CharacterViewEquipmentInfo;
