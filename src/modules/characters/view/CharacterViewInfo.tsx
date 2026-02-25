import React, { FC } from 'react';
import { Badge, Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character, STATS } from '../../api/character.dto';
import NumericCard from '../../shared/cards/NumericCard';
import TextCard from '../../shared/cards/TextCard';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;

const CharacterViewInfo: FC<{
  character: Character;
}> = ({ character }) => {
  const getArmorType = () => {
    const armor = character.defense.armor;
    if (!armor) return null;
    if (armor.at) return t(`${armor.at}`);
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  const getResistanceImage = (resistance: string) => {
    switch (resistance) {
      case 'disease':
      case 'poison':
      case 'fear':
        return `${imageBaseUrl}images/generic/${resistance}.png`;
      default:
        return `${imageBaseUrl}images/generic/trait.png`;
    }
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('general')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <TextCard
              value={t(character.info.realmType)}
              subtitle={t('realm')}
              image={`${imageBaseUrl}images/generic/realm.png`}
            />
            <TextCard
              value={t(`size-${character.info.sizeId}`)}
              subtitle={t('size')}
              image={`${imageBaseUrl}images/generic/race-size.png`}
            />
            <TextCard
              value={`${character.info.height}'`}
              subtitle={t('height')}
              image={`${imageBaseUrl}images/generic/character-height.png`}
            />
            <TextCard
              value={`${character.info.weight} lbs`}
              subtitle={t('weight')}
              image={`${imageBaseUrl}images/generic/character-weight.png`}
            />
            <Badge color="error" badgeContent={character.hp.max} invisible={character.hp.max > 0}>
              <TextCard
                value={`${character.hp.current} / ${character.hp.max}`}
                subtitle={t('hit-points')}
                image={`${imageBaseUrl}images/generic/hp.png`}
              />
            </Badge>
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="primary" variant="h6">
            {t('experience')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
              invisible={character.experience.availableLevel <= character.experience.level}
            >
              <NumericCard
                value={character.experience.level}
                subtitle={t('current-level')}
                image={`${imageBaseUrl}images/generic/experience.png`}
                applyColor={false}
              />
            </Badge>
            <NumericCard
              value={character.experience.xp}
              subtitle={t('xp')}
              image={`${imageBaseUrl}images/generic/experience.png`}
              applyColor={false}
              applyFormat={true}
            />
            <Badge
              color="success"
              badgeContent={`+${character.experience.availableDevelopmentPoints}`}
              invisible={character.experience.availableDevelopmentPoints < 1}
            >
              <TextCard
                value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
                subtitle={t('development-points')}
                image={`${imageBaseUrl}images/generic/trait-combat.png`}
              />
            </Badge>
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="primary" variant="h6">
            {t('stats')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {STATS.map((stat) => (
              <NumericCard
                key={stat}
                value={character.statistics[stat].totalBonus}
                subtitle={t(stat)}
                image={`${imageBaseUrl}images/generic/stat-${stat}.png`}
              />
            ))}
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="primary" variant="h6">
            {t('defense')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.defense.defensiveBonus}
              subtitle={t('defensive-bonus')}
              image={`${imageBaseUrl}images/generic/defensive-bonus.png`}
            />
            <TextCard
              value={getArmorType()}
              subtitle={t('armor-type')}
              image={`${imageBaseUrl}images/generic/armor.png`}
            />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="primary" variant="h6">
            {t('movement')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <TextCard
              value={`${character.movement.baseMovementRate}' /rnd`}
              subtitle={t('base-movement-rate')}
              image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            />
            <NumericCard
              value={character.movement.strideRacialBonus}
              subtitle={t('stride-racial-bonus')}
              image={`${imageBaseUrl}images/generic/stride-bonus.png`}
              applyColor={false}
            />
            <NumericCard
              value={character.movement.strideQuBonus}
              subtitle={t('stride-stat-bonus')}
              image={`${imageBaseUrl}images/generic/stride-bonus.png`}
              applyColor={false}
            />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="primary" variant="h6">
            {t('initiative')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.initiative.totalBonus}
              subtitle={t('initiative-total-bonus')}
              image={`${imageBaseUrl}images/generic/initiative.png`}
              applyColor={false}
            />
            <NumericCard
              value={character.initiative.baseBonus}
              subtitle={t('initiative-base-bonus')}
              image={`${imageBaseUrl}images/generic/initiative.png`}
              applyColor={false}
            />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="primary" variant="h6">
            {t('resistances')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {character.resistances.map((resistance) => (
              <NumericCard
                key={resistance.resistance}
                value={resistance.totalBonus}
                subtitle={t(resistance.resistance)}
                image={getResistanceImage(resistance.resistance)}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewInfo;
