import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Grid, Tooltip, Typography } from '@mui/material';
import { CategorySeparator, Character, RmuTextCard, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { imageBaseUrl } from '../../services/config';

const grayscale = 0.7;
const gridSizeCard = { xs: 10, sm: 5, md: 5, lg: 3, xl: 2 } as const;

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
      return `${character.experience.level} (${character.experience.availableLevel})`;
    }
    return `${character.experience.level}`;
  };

  if (!character || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <CategorySeparator text={t('Character')} />
      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={strategicGame.name}
            subtitle={t('Game')}
            image={strategicGame.imageUrl || ''}
            onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.faction.name}
            subtitle={t('Faction')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/strategic/factions/view/${character.faction.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.info.race.name}
            subtitle={t('Race')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            onClick={() => navigate(`/core/races/view/${character.info.race.id}`)}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(character.info.professionId)}
            subtitle={t('Profession')}
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
            subtitle={t('Realm')}
            image={`${imageBaseUrl}images/generic/realm.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(`size-${character.info.sizeId}`)}
            subtitle={t('Size')}
            image={`${imageBaseUrl}images/generic/race-size.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={`${character.info.height}'`}
            subtitle={t('Height')}
            image={`${imageBaseUrl}images/generic/character-height.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={`${character.info.weight} lbs`}
            subtitle={t('Weight')}
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
              subtitle={t('Hit points')}
              image={`${imageBaseUrl}images/generic/hp.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

      <CategorySeparator text={t('Experience')} />

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
            badgeContent={`+${character.experience.availableDevelopmentPoints}`}
            invisible={character.experience.availableDevelopmentPoints < 1}
            sx={{ display: 'block' }}
          >
            <RmuTextCard
              value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
              subtitle={t('Development points')}
              image={`${imageBaseUrl}images/generic/trait-combat.png`}
              grayscale={grayscale}
            />
          </Badge>
        </Grid>
      </Grid>

      <CategorySeparator text={t('Statistics')} />

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

      <CategorySeparator text={t('Defense')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.defense.defensiveBonus}
            subtitle={t('Defensive bonus')}
            image={`${imageBaseUrl}images/generic/defensive-bonus.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={getArmorType()}
            subtitle={t('Armor type')}
            image={`${imageBaseUrl}images/generic/armor.png`}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('Movement')} />

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
                subtitle={t('Base movement rate')}
                image={`${imageBaseUrl}images/generic/stride-bonus.png`}
                grayscale={grayscale}
              />
            </div>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.strideRacialBonus}
            subtitle={t('Stride racial bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.strideQuBonus}
            subtitle={t('Stride stat bonus')}
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
