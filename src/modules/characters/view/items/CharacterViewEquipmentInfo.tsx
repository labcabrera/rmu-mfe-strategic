import React from 'react';
import { Grid, Tooltip, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import { imageBaseUrl } from '../../../services/config';
import { gridSizeCard } from '../../../services/display';
import RmuTextCard from '../../../shared/cards/RmuTextCard';
import TextCard from '../../../shared/cards/TextCard';

const grayscale = 0.7;

const CharacterViewEquipmentInfo: React.FC<{
  character: Character;
}> = ({ character }) => {
  const getArmorManeuverSkill = (): number | undefined => {
    return character.skills.find((s) => s.skillId === 'armor-maneuver')?.totalBonus || undefined;
  };

  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  const getLabelWeight = () => {
    return `${character.equipment.weight} (${character.equipment.weightAllowance}) lbs`;
  };

  const getLabelManeuverPenalty = () => {
    if (character.equipment.baseManeuverPenalty >= 0) {
      return `${character.equipment.baseManeuverPenalty}`;
    }
    return `${character.equipment.maneuverPenalty} (${character.equipment.baseManeuverPenalty} + ${getArmorManeuverSkill()})`;
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
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
          <Tooltip
            title={
              <>
                <Typography color="inherit">Carried weight (Allowance)</Typography>
                <Typography color="inherit">WA: 15% + 2 x Strength Modifier</Typography>
              </>
            }
            arrow
          >
            <span>
              <RmuTextCard
                value={getLabelWeight()}
                subtitle={t('Carried weight')}
                image={`${imageBaseUrl}images/generic/carried-weight.png`}
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <Tooltip
            title={
              <>
                <Typography color="inherit">Encumbrance penalty</Typography>
                <Typography color="inherit">EP = Load (%) – WA (%)</Typography>
              </>
            }
            arrow
          >
            <span>
              <RmuTextCard
                value={character.equipment.encumbrancePenalty || 0}
                subtitle={t('Encumbrance penalty')}
                image={`${imageBaseUrl}images/generic/weight-penalty.png`}
                applyColor={true}
                grayscale={grayscale}
              />
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Grid container spacing={1} mt={1}>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
            subtitle={t('Movement base difficulty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <Tooltip
            title={
              <>
                <Typography color="inherit">Maneuver penalty</Typography>
                <Typography color="inherit">Penalty = Armor Penalty + Armor Skill</Typography>
              </>
            }
            arrow
          >
            <span>
              <RmuTextCard
                value={getLabelManeuverPenalty()}
                subtitle={t('Armor penalty')}
                image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
                grayscale={grayscale}
              />
            </span>
          </Tooltip>
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.rangedPenalty || 0}
            subtitle={t('Ranged penalty')}
            image={`${imageBaseUrl}images/generic/armor-ranged-penalty.png`}
            grayscale={grayscale}
            applyColor={true}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          <RmuTextCard
            value={character.equipment.perceptionPenalty || 0}
            subtitle={t('Perception penalty')}
            image={`${imageBaseUrl}images/generic/armor-perception-penalty.png`}
            grayscale={grayscale}
            applyColor={true}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterViewEquipmentInfo;
