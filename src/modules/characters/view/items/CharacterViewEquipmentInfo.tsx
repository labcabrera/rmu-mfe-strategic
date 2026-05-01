import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Tooltip, Typography } from '@mui/material';
import { CategorySeparator, Character, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../../../services/config';
import { gridSizeCard } from '../../../services/display';

const grayscale = 0.7;

const CharacterViewEquipmentInfo: React.FC<{
  character: Character;
}> = ({ character }) => {
  const { t } = useTranslation();

  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
      <CategorySeparator text={t('weight-info')} />
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
                subtitle={`${t('carried-weight')} (lbs)`}
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
                subtitle={`${t('weight-allowance')} (lbs)`}
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
                <Typography color="inherit">{t('encumbrance-penalty')} </Typography>
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
                subtitle={t('encumbrance-penalty')}
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
            subtitle={t('max-pace')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('armor')} />
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <Tooltip title={'AT (head / body / arms / legs)'} arrow>
            <RmuTextCard
              value={getArmorType()}
              subtitle={t('armor-type')}
              image={`${imageBaseUrl}images/generic/armor.png`}
              grayscale={grayscale}
            />
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.maneuverPenalty}
            subtitle={t('armor-penalty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.baseManeuverPenalty}
            subtitle={t('armor-base-penalty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
            subtitle={t('movement-base-difficulty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            grayscale={grayscale}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.rangedPenalty || 0}
            subtitle={t('ranged-penalty')}
            image={`${imageBaseUrl}images/generic/armor-ranged-penalty.png`}
            grayscale={grayscale}
            applyColor
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.perceptionPenalty || 0}
            subtitle={t('perception-penalty')}
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
