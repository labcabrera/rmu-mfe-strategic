import React, { FC } from 'react';
import { Badge, Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character, STATS } from '../../api/character.dto';
import { imageBaseUrl } from '../../services/config';
import NumericCard from '../../shared/cards/NumericCard';
import RmuTextCard from '../../shared/cards/RmuTextCard';
import TextCard from '../../shared/cards/TextCard';
import CategorySeparator from '../../shared/display/CategorySeparator';

const grayscale = 0.7;

const CharacterViewInfo: FC<{
  character: Character;
}> = ({ character }) => {
  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
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
      <CategorySeparator text={t('general')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={t(character.info.realmType)}
            subtitle={t('realm')}
            image={`${imageBaseUrl}images/generic/realm.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={t(`size-${character.info.sizeId}`)}
            subtitle={t('size')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={`${character.info.height}'`}
            subtitle={t('height')}
            image={`${imageBaseUrl}images/generic/character-height.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={`${character.info.weight} lbs`}
            subtitle={t('weight')}
            image={`${imageBaseUrl}images/generic/character-weight.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Badge color="error" badgeContent={character.hp.max} invisible={character.hp.max > 0}>
            <RmuTextCard
              value={`${character.hp.current} / ${character.hp.max}`}
              subtitle={t('hit-points')}
              image={`${imageBaseUrl}images/generic/hp.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

      <CategorySeparator text={t('experience')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 12, md: 2 }}>
          <Badge
            color="success"
            badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
            invisible={character.experience.availableLevel <= character.experience.level}
          >
            <RmuTextCard
              value={character.experience.level}
              subtitle={t('current-level')}
              image={`${imageBaseUrl}images/generic/experience.png`}
              applyColor={false}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.experience.xp}
            subtitle={t('xp')}
            image={`${imageBaseUrl}images/generic/experience.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Badge
            color="success"
            badgeContent={`+${character.experience.availableDevelopmentPoints}`}
            invisible={character.experience.availableDevelopmentPoints < 1}
          >
            <RmuTextCard
              value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
              subtitle={t('development-points')}
              image={`${imageBaseUrl}images/generic/trait-combat.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

      <CategorySeparator text={t('stats')} />

      <Grid container spacing={1} columns={10}>
        {STATS.map((stat) => (
          <Grid key={stat} size={{ xs: 12, md: 2 }}>
            <RmuTextCard
              key={stat}
              value={character.statistics[stat].totalBonus}
              subtitle={t(stat)}
              image={`${imageBaseUrl}images/generic/stat-${stat}.png`}
              applyColor={true}
              grayscale={grayscale}
            />
          </Grid>
        ))}
      </Grid>

      <CategorySeparator text={t('defense')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.defense.defensiveBonus}
            subtitle={t('defensive-bonus')}
            image={`${imageBaseUrl}images/generic/defensive-bonus.png`}
            applyColor={true}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={getArmorType()}
            subtitle={t('armor-type')}
            image={`${imageBaseUrl}images/generic/armor.png`}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('movement')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={`${character.movement.baseMovementRate}' /rnd`}
            subtitle={t('base-movement-rate')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.movement.strideRacialBonus}
            subtitle={t('stride-racial-bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            applyColor={true}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.movement.strideQuBonus}
            subtitle={t('stride-stat-bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            applyColor={true}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('initiative')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.initiative.totalBonus}
            subtitle={t('initiative-total-bonus')}
            image={`${imageBaseUrl}images/generic/initiative.png`}
            applyColor={true}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.initiative.baseBonus}
            subtitle={t('initiative-base-bonus')}
            image={`${imageBaseUrl}images/generic/initiative.png`}
            applyColor={true}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('resistances')} />

      <Grid container spacing={1} columns={10}>
        {character.resistances.map((resistance) => (
          <Grid key={resistance.resistance} size={{ xs: 12, md: 2 }}>
            <RmuTextCard
              key={resistance.resistance}
              value={resistance.totalBonus}
              subtitle={t(resistance.resistance)}
              image={getResistanceImage(resistance.resistance)}
              grayscale={grayscale}
              applyColor={true}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CharacterViewInfo;
