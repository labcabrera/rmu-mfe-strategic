import React, { FC } from 'react';
import { Badge, Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character, stats } from '../../api/character.dto';
import NumericCard from '../../shared/cards/NumericCard';
import TextCard from '../../shared/cards/TextCard';

const CharacterViewInfo: FC<{
  character: Character;
}> = ({ character }) => {
  const getArmorType = () => {
    const armor = character.defense.armor;
    if (!armor) return null;
    if (armor.at) return t(armor.at);
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  const getResistanceImage = (resistance: string) => {
    switch (resistance) {
      case 'disease':
      case 'poison':
      case 'fear':
        return `/static/images/generic/${resistance}.png`;
      default:
        return `/static/images/generic/trait.png`;
    }
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6" color="secondary">
            {t('general')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <TextCard
              value={t(character.info.realmType)}
              subtitle={t('realm')}
              image={`/static/images/generic/realm.png`}
            />
            <TextCard
              value={t(character.info.sizeId)}
              subtitle={t('size')}
              image={`/static/images/generic/race-size.png`}
            />
            <NumericCard
              value={character.info.height}
              subtitle={t('height')}
              image={`/static/images/generic/character-height.png`}
            />
            <NumericCard
              value={character.info.weight}
              subtitle={t('weight')}
              image={`/static/images/generic/character-weight.png`}
            />
            <TextCard
              value={`${character.hp.current} / ${character.hp.max}`}
              subtitle={t('hit-points')}
              image={`/static/images/generic/hp.png`}
            />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('experience')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <Badge
              color="warning"
              badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
              invisible={character.experience.availableLevel <= character.experience.level}
            >
              <NumericCard
                value={character.experience.level}
                subtitle={t('current-level')}
                image={`/static/images/generic/experience.png`}
                applyColor={false}
              />
            </Badge>
            <NumericCard
              value={character.experience.xp}
              subtitle={t('xp')}
              image={`/static/images/generic/experience.png`}
              applyColor={false}
              applyFormat={true}
            />
            <Badge
              color="warning"
              badgeContent={`+${character.experience.availableDevelopmentPoints}`}
              invisible={character.experience.availableDevelopmentPoints < 1}
            >
              <TextCard
                value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
                subtitle={t('development-points')}
                image={`/static/images/generic/trait-combat.png`}
              />
            </Badge>
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('defense')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.defense.defensiveBonus}
              subtitle={t('defensive-bonus')}
              image={`/static/images/generic/defensive-bonus.png`}
            />
            <TextCard value={getArmorType()} subtitle={t('armor-type')} image={`/static/images/generic/armor.png`} />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('movement')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.movement.baseMovementRate}
              subtitle={t('base-movement-rate')}
              image={`/static/images/generic/stride-bonus.png`}
              applyColor={false}
            />
            <NumericCard
              value={character.movement.strideRacialBonus}
              subtitle={t('stride-racial-bonus')}
              image={`/static/images/generic/stride-bonus.png`}
              applyColor={false}
            />
            <NumericCard
              value={character.movement.strideQuBonus}
              subtitle={t('stride-stat-bonus')}
              image={`/static/images/generic/stride-bonus.png`}
              applyColor={false}
            />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('initiative')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <NumericCard
              value={character.initiative.totalBonus}
              subtitle={t('initiative-total-bonus')}
              image={`/static/images/generic/initiative.png`}
              applyColor={false}
            />
            <NumericCard
              value={character.initiative.baseBonus}
              subtitle={t('initiative-base-bonus')}
              image={`/static/images/generic/initiative.png`}
              applyColor={false}
            />
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
            {t('stats')}
          </Typography>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            {stats.map((stat) => (
              <NumericCard
                key={stat}
                value={character.statistics[stat].totalBonus}
                subtitle={t(stat)}
                image={`/static/images/generic/stat-${stat}.png`}
              />
            ))}
          </Box>
        </Grid>
        <Grid size={12}>
          <Typography color="secondary" variant="h6">
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
