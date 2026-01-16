import React from 'react';
import { Box, Grid, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import NumericCard from '../../../shared/cards/NumericCard';
import TextCard from '../../../shared/cards/TextCard';

const CharacterViewEquipmentInfo: React.FC<{
  character: Character;
}> = ({ character }) => {
  if (!character) return <div>Loading...</div>;

  const getArmorManeuverSkill = (): number | undefined => {
    return character.skills.find((s) => s.skillId === 'armor-maneuver')?.totalBonus || undefined;
  };

  const getArmorType = () => {
    const armor = character.defense.armor;
    if (!armor) return null;
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  const getLabelWeight = () => {
    return `${character.equipment.weight} (${character.equipment.weightAllowance}) lbs`;
  };

  const getLabelManeuverPenalty = () => {
    if (character.equipment.baseManeuverPenalty >= 0) {
      return `xx ${character.equipment.baseManeuverPenalty}`;
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
              image={`/static/images/generic/armor.png`}
              minWidth={300}
            />
          </Tooltip>
          <Tooltip title={'Carried weight (Carried allowance)'}>
            <TextCard
              value={getLabelWeight()}
              subtitle={t('carried-weight')}
              image={`/static/images/generic/carried-weight.png`}
              minWidth={300}
            />
          </Tooltip>
          <NumericCard
            value={character.equipment.encumbrancePenalty}
            subtitle={t('weight-penalty')}
            image={`/static/images/generic/weight-penalty.png`}
            minWidth={300}
          />
        </Box>
        <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
          <TextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
            subtitle={t('movement-base-difficulty')}
            image={`/static/images/generic/maneuver-penalty.png`}
            minWidth={300}
          />
          <TextCard
            value={getLabelManeuverPenalty()}
            subtitle={t('Maneuver penalty')}
            image={`/static/images/generic/maneuver-penalty.png`}
            color={character.equipment.maneuverPenalty < 0 ? 'red' : undefined}
            minWidth={300}
          />
          <NumericCard
            value={character.equipment.rangedPenalty}
            subtitle={t('ranged-penalty')}
            image={`/static/images/generic/armor-ranged-penalty.png`}
            minWidth={300}
          />
          <NumericCard
            value={character.equipment.perceptionPenalty}
            subtitle={t('perception-penalty')}
            image={`/static/images/generic/armor-perception-penalty.png`}
            minWidth={300}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default CharacterViewEquipmentInfo;
