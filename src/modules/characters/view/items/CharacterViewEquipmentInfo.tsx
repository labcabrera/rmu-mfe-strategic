import React from 'react';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import NumericCard from '../../../shared/cards/NumericCard';
import TextCard from '../../../shared/cards/TextCard';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;

const CharacterViewEquipmentInfo: React.FC<{
  character: Character;
}> = ({ character }) => {
  if (!character) return <div>Loading...</div>;

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

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
          <Tooltip title={'Armor Type (head / body / arms / legs)'} arrow>
            <TextCard
              value={getArmorType()}
              subtitle={t('armor-type')}
              image={`${imageBaseUrl}images/generic/armor.png`}
              minWidth={300}
            />
          </Tooltip>
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">Carried weight (Allowance)</Typography>
                <Typography color="inherit">WA: 15% + 2 x Strength Modifier</Typography>
              </React.Fragment>
            }
            arrow
          >
            <span>
              <TextCard
                value={getLabelWeight()}
                subtitle={t('carried-weight')}
                image={`${imageBaseUrl}images/generic/carried-weight.png`}
                minWidth={300}
              />
            </span>
          </Tooltip>
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">Encumbrance penalty</Typography>
                <Typography color="inherit">EP = Load (%) – WA (%)</Typography>
              </React.Fragment>
            }
            arrow
          >
            <span>
              <NumericCard
                value={character.equipment.encumbrancePenalty || 0}
                subtitle={t('Encumbrance penalty')}
                image={`${imageBaseUrl}images/generic/weight-penalty.png`}
                minWidth={300}
              />
            </span>
          </Tooltip>
        </Box>
        <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
          <TextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
            subtitle={t('movement-base-difficulty')}
            image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
            minWidth={300}
          />
          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">Maneuver penalty</Typography>
                <Typography color="inherit">Penalty = Armor Penalty + Armor Skill</Typography>
              </React.Fragment>
            }
            arrow
          >
            <span>
              <TextCard
                value={getLabelManeuverPenalty()}
                subtitle={t('Armor penalty')}
                image={`${imageBaseUrl}images/generic/maneuver-penalty.png`}
                color={
                  character.equipment.maneuverPenalty
                    ? character.equipment.maneuverPenalty < 0
                      ? 'red'
                      : undefined
                    : undefined
                }
                minWidth={300}
              />
            </span>
          </Tooltip>
          <NumericCard
            value={character.equipment.rangedPenalty || 0}
            subtitle={t('ranged-penalty')}
            image={`${imageBaseUrl}images/generic/armor-ranged-penalty.png`}
            minWidth={300}
          />
          <NumericCard
            value={character.equipment.perceptionPenalty || 0}
            subtitle={t('perception-penalty')}
            image={`${imageBaseUrl}images/generic/armor-perception-penalty.png`}
            minWidth={300}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default CharacterViewEquipmentInfo;
