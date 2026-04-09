import React from 'react';
import { Grid, Tooltip, Typography } from '@mui/material';
import { CategorySeparator, Character, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { imageBaseUrl } from '../../../services/config';
import { gridSizeCard } from '../../../services/display';

const grayscale = 0.7;

const CharacterViewEquipmentInfo: React.FC<{
  character: Character;
}> = ({ character }) => {
  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
      <CategorySeparator text={t('Weight info')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">Carried weight</Typography>
              </React.Fragment>
            }
            arrow
          >
            <span>
              <RmuTextCard
                value={character.equipment.weight}
                subtitle={`${t('Carried weight')} (lbs)`}
                image={`${imageBaseUrl}images/generic/carried-weight.png`}
                grayscale={grayscale}
                applyColor
                color={character.equipment.weight > character.equipment.weightAllowance ? 'red' : undefined}
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">
                  <em>WA: 15% + 2 x Strength Modifier</em>
                </Typography>
              </React.Fragment>
            }
            arrow
          >
            <span>
              <RmuTextCard
                value={character.equipment.weightAllowance}
                subtitle={`${t('Weight allowance')} (lbs)`}
                image={`${imageBaseUrl}images/generic/carried-weight.png`}
                grayscale={grayscale}
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <Tooltip
            title={
              <>
                <Typography color="inherit">Encumbrance penalty</Typography>
                <Typography color="inherit">
                  <em>EP = Load (%) – WA (%)</em>
                </Typography>
              </>
            }
            arrow
          >
            <span>
              <RmuTextCard
                value={character.equipment.encumbrancePenalty || 0}
                subtitle={t('Encumbrance penalty')}
                image={`${imageBaseUrl}images/generic/weight-penalty.png`}
                applyColor
                grayscale={grayscale}
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(character.movement.maxPace)}
            subtitle={t('Max pace')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('Armor')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <Tooltip title={'Armor Type (head / body / arms / legs)'} arrow>
            <RmuTextCard
              value={getArmorType()}
              subtitle={t('Armor type')}
              image={`${imageBaseUrl}images/generic/armor.png`}
              grayscale={grayscale}
            />
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.maneuverPenalty}
            subtitle={t('Armor penalty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.baseManeuverPenalty}
            subtitle={t('Armor base penalty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
            subtitle={t('Movement base difficulty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.rangedPenalty || 0}
            subtitle={t('Ranged penalty')}
            image={`${imageBaseUrl}images/generic/armor-ranged-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.perceptionPenalty || 0}
            subtitle={t('Perception penalty')}
            image={`${imageBaseUrl}images/generic/armor-perception-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewEquipmentInfo;
