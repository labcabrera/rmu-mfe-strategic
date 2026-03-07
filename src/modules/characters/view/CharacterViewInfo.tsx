import React, { FC, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character, STATS } from '../../api/character.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import NumericCard from '../../shared/cards/NumericCard';
import RmuTextCard from '../../shared/cards/RmuTextCard';
import TextCard from '../../shared/cards/TextCard';
import CategorySeparator from '../../shared/display/CategorySeparator';

const grayscale = 0.7;

const CharacterViewInfo: FC<{
  strategicGame: StrategicGame;
  character: Character;
}> = ({ character, strategicGame }) => {
  const navigate = useNavigate();

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

  const getLevelText = () => {
    if (character.experience.availableLevel > character.experience.level) {
      return `${character.experience.level} (${character.experience.availableLevel - character.experience.level})`;
    }
    return `${character.experience.level}`;
  };

  if (!character || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <CategorySeparator text={t('Character')} />
      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={strategicGame.name}
            subtitle={t('Game')}
            image={strategicGame.imageUrl}
            onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.faction.name}
            subtitle={t('Faction')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/strategic/factions/view/${character.faction.id}`)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={character.info.race.name}
            subtitle={t('Race')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/core/races/view/${character.info.race.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RmuTextCard
            value={t(character.info.professionId)}
            subtitle={t('Profession')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/core/professions/view/${character.info.professionId}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Badge
            color="success"
            badgeContent={`+${character.experience.availableLevel - character.experience.level}`}
            invisible={character.experience.availableLevel <= character.experience.level}
            sx={{ display: 'block' }}
          >
            <RmuTextCard
              value={getLevelText()}
              subtitle={t('Level')}
              image={`${imageBaseUrl}images/generic/experience.png`}
              applyColor={false}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

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
          <Badge
            color="error"
            badgeContent={character.hp.max}
            invisible={character.hp.max > 0}
            sx={{ display: 'block' }}
          >
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
            sx={{ display: 'block' }}
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
