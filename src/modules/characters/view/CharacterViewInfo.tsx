import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction';
import { StrategicGame } from '../../api/strategic-games';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';
import DefenseTextField from '../../shared/inputs/DefenseTextField';
import HeightTextField from '../../shared/inputs/HeightTextField';
import HpTextField from '../../shared/inputs/HpTextField';
import ImageTextField from '../../shared/inputs/ImageTextField';
import LevelTextField from '../../shared/inputs/LevelTextField';
import RaceTextField from '../../shared/inputs/RaceTextField';

const CharacterViewInfo: FC<{
  character: Character;
  strategicGame: StrategicGame;
  faction: Faction;
}> = ({ character, strategicGame, faction }) => {
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
      <Grid container spacing={3}>
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={handleOpenGame}>
                    <ArrowForwardIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('faction')}
            variant="standard"
            fullWidth
            value={faction?.name || ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={handleOpenFaction}>
                    <ArrowForwardIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={3}>
          <RaceTextField value={t(character.info.raceId)} />
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('profession')}
            name="profession"
            value={t(character.info.professionId)}
            variant="standard"
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('realm')}
            name="realm"
            value={t(character.info.realmType)}
            variant="standard"
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>

        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('experience')}
          </Typography>
        </Grid>
        <Grid size={3}>
          <ImageTextField label={t('current-level')} value={character.experience.level} imageName="level" />
        </Grid>
        <Grid size={3}>
          <ImageTextField label={t('available-level')} value={character.experience.availableLevel} imageName="level" />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('xp')}
            value={new Intl.NumberFormat('en-EN').format(character.experience.xp)}
            imageName="level"
          />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('development-points')}
            value={character.experience.developmentPoints / character.experience.availableDevelopmentPoints}
            imageName="level"
          />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('general-info')}
          </Typography>
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('size')}
            name="size"
            value={t(`size-${character.info.sizeId}`)}
            InputProps={{ readOnly: true }}
            variant="standard"
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <HeightTextField value={character.info.height} readOnly />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('weight')}
            value={new Intl.NumberFormat('en-EN').format(character.info.weight)}
            imageName="weight"
          />
        </Grid>
        <Grid size={3}>
          <HpTextField value={character.hp.current} />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('defense')}
          </Typography>
        </Grid>
        <Grid size={3}>
          <DefenseTextField i18nLabel={'armor-type'} value={character.defense.armorType} />
        </Grid>
        <Grid size={3}>
          <DefenseTextField i18nLabel={'defensive-bonus'} value={character.defense.defensiveBonus} />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('movement')}
          </Typography>
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('stride-racial-bonus')}
            value={character.movement.strideRacialBonus}
            imageName="movement"
          />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('stride-stat-bonus')}
            value={character.movement.strideQuBonus}
            imageName="movement"
          />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('base-movement-rate')}
            value={character.movement.baseMovementRate}
            imageName="movement"
          />
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('initiative')}
          </Typography>
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('initiative-base-bonus')}
            value={character.initiative.baseBonus}
            imageName="initiative"
          />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('initiative-custom-bonus')}
            value={character.initiative.customBonus}
            imageName="initiative"
          />
        </Grid>
        <Grid size={3}>
          <ImageTextField
            label={t('initiative-total-bonus')}
            value={character.initiative.totalBonus}
            imageName="initiative"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewInfo;
