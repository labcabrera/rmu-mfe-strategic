import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Tooltip, Typography } from '@mui/material';
import { CategorySeparator, Character, RmuTextCard, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../../services/config';

const grayscale = 0.7;
const gridSizeCard = { xs: 10, sm: 5, md: 5, lg: 3, xl: 2 } as const;

const CharacterViewInfo: FC<{
  strategicGame: StrategicGame;
  character: Character;
}> = ({ character, strategicGame }) => {
  const { t } = useTranslation();

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

  if (!character || !strategicGame) return <div>Loading...</div>;

  return (
    <>
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

      <CategorySeparator text={t('information')} />
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
                subtitle={t('bmr')}
                image={`${imageBaseUrl}images/generic/stride-bonus.png`}
                grayscale={grayscale}
              />
            </div>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.modifiers ? character.movement.modifiers['racial'] : 0}
            subtitle={t('stride-racial-bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.movement.modifiers ? character.movement.modifiers['qu'] : 0}
            subtitle={t('stride-stat-bonus')}
            image={`${imageBaseUrl}images/generic/stride-bonus.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('initiative')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.initiative.totalBonus}
            subtitle={t('initiative-total-bonus')}
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
                subtitle={t('initiative-stat-bonus')}
                image={`${imageBaseUrl}images/generic/initiative.png`}
                grayscale={grayscale}
                applyColor
              />
            </Grid>
            <Grid size={gridSizeCard}>
              <RmuTextCard
                value={character.initiative.modifiers['trait'] || 0}
                subtitle={t('initiative-trait-bonus')}
                image={`${imageBaseUrl}images/generic/initiative.png`}
                grayscale={grayscale}
                applyColor
              />
            </Grid>
          </>
        )}
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
              applyColor
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CharacterViewInfo;
