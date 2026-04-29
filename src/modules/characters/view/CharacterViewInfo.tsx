import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Badge, Grid, Tooltip, Typography } from '@mui/material';
import { CategorySeparator, Character, RmuTextCard, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../../services/config';

const grayscale = 0.7;
const gridSizeCard = { xs: 10, sm: 5, md: 5, lg: 3, xl: 2 } as const;

const CharacterViewInfo: FC<{
  strategicGame: StrategicGame;
  character: Character;
}> = ({ character, strategicGame }) => {
  const { t } = useTranslation();
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
      return `${character.experience.level} (${character.experience.availableLevel})`;
    }
    return `${character.experience.level}`;
  };

  if (!character || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <CategorySeparator text={t('character')} />
      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={strategicGame.name}
            subtitle={t('strategic-game')}
            image={strategicGame.imageUrl || ''}
            onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.faction.name}
            subtitle={t('faction')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/strategic/factions/view/${character.faction.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.info.race.name}
            subtitle={t('race')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/core/races/view/${character.info.race.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(character.info.professionId)}
            subtitle={t('profession')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/core/professions/view/${character.info.professionId}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
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
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

      <CategorySeparator text={t('General info')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(character.info.realmType)}
            subtitle={t('realm')}
            image={`${imageBaseUrl}images/generic/realm.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(`size-${character.info.sizeId}`)}
            subtitle={t('size')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={`${character.info.height}'`}
            subtitle={t('height')}
            image={`${imageBaseUrl}images/generic/character-height.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={`${character.info.weight} lbs`}
            subtitle={t('weight')}
            image={`${imageBaseUrl}images/generic/character-weight.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
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
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={new Intl.NumberFormat('en-US').format(character.experience.xp)}
            subtitle={t('xp')}
            image={`${imageBaseUrl}images/generic/experience.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <Badge
            color="success"
            badgeContent={`+${character.experience.availableDevPoints}`}
            invisible={character.experience.availableDevPoints < 1}
            sx={{ display: 'block' }}
          >
            <RmuTextCard
              value={`${character.experience.availableDevPoints} / ${character.experience.devPoints}`}
              subtitle={t('dev-points')}
              image={`${imageBaseUrl}images/generic/trait-combat.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

      <CategorySeparator text={t('statistics')} />

      <Grid container spacing={1} columns={10}>
        {STATS.map((stat) => (
          <Grid key={stat} size={gridSizeCard}>
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
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.defense.defensiveBonus}
            subtitle={t('defensive-bonus')}
            image={`${imageBaseUrl}images/generic/defensive-bonus.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={getArmorType()}
            subtitle={t('armor-type')}
            image={`${imageBaseUrl}images/generic/armor.png`}
            grayscale={grayscale}
          />
        </Grid>
        {character.defense.shield && (
          <>
            <Grid size={gridSizeCard}>
              <RmuTextCard
                value={character.defense.shield.db}
                subtitle={t('shield-db')}
                image={`${imageBaseUrl}images/generic/armor.png`}
                grayscale={grayscale}
              />
            </Grid>
            <Grid size={gridSizeCard}>
              <RmuTextCard
                value={character.defense.shield.blockCount}
                subtitle={t('shield-block-count')}
                image={`${imageBaseUrl}images/generic/armor.png`}
                grayscale={grayscale}
              />
            </Grid>
          </>
        )}
      </Grid>

      <CategorySeparator text={t('movement')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">
                  <em>BMR = 20' + Qu/2 + Stride bonus</em>
                </Typography>
              </React.Fragment>
            }
            arrow
          >
            <div>
              <RmuTextCard
                value={`${character.movement.baseMovementRate}' /rnd`}
                subtitle={t('base-movement-rate')}
                image={`${imageBaseUrl}images/generic/stride-bonus.png`}
                grayscale={grayscale}
              />
            </div>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.modifiers['racial'] || 0}
            subtitle={t('stride-racial-bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.modifiers['qu']}
            subtitle={t('stride-stat-bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('initiative')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.initiative.totalBonus}
            subtitle={t('Initiative total bonus')}
            image={`${imageBaseUrl}images/generic/initiative.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        {character.initiative.modifiers && (
          <>
            <Grid size={gridSizeCard}>
              <RmuTextCard
                value={character.initiative.modifiers['stat'] || 0}
                subtitle={t('Initiative stat bonus')}
                image={`${imageBaseUrl}images/generic/initiative.png`}
                grayscale={grayscale}
                applyColor
              />
            </Grid>
            <Grid size={gridSizeCard}>
              <RmuTextCard
                value={character.initiative.modifiers['trait'] || 0}
                subtitle={t('Initiative trait bonus')}
                image={`${imageBaseUrl}images/generic/initiative.png`}
                grayscale={grayscale}
                applyColor
              />
            </Grid>
          </>
        )}
      </Grid>

      <CategorySeparator text={t('Resistances')} />

      <Grid container spacing={1} columns={10}>
        {character.resistances.map((resistance) => (
          <Grid key={resistance.resistance} size={{ xs: 12, md: 2 }}>
            <RmuTextCard
              key={resistance.resistance}
              value={resistance.totalBonus}
              subtitle={t(resistance.resistance)}
              image={getResistanceImage(resistance.resistance)}
              grayscale={grayscale}
              applyColor
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CharacterViewInfo;
