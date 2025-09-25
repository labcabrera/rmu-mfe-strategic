import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import NumericCard from '../../shared/cards/NumericCard';
import TextCard from '../../shared/cards/TextCard';

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
    if (armor.at) return t(armor.at);
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('equipment-info')}
        </Typography>
      </Grid>
      <Grid size={12}>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          <TextCard value={getArmorType()} subtitle={t('armor-type')} image={`/static/images/generic/armor.png`} />
          <NumericCard
            value={getArmorManeuverSkill()}
            subtitle={t('armor-maneuver-skill')}
            image={`/static/images/generic/carried-weight.png`}
          />
          <NumericCard
            value={character.equipment.weight}
            subtitle={t('carried-weight')}
            image={`/static/images/generic/carried-weight.png`}
            applyColor={false}
          />
          <NumericCard
            value={character.equipment.weightAllowance}
            subtitle={t('Weight allowance')}
            image={`/static/images/generic/carried-weight.png`}
            applyColor={false}
          />
          <NumericCard
            value={character.equipment.encumbrancePenalty}
            subtitle={t('weight-penalty')}
            image={`/static/images/generic/weight-penalty.png`}
          />
          <NumericCard
            value={character.equipment.maneuverPenalty}
            subtitle={t('maneuver-penalty')}
            image={`/static/images/generic/maneuver-penalty.png`}
          />
          <NumericCard
            value={character.equipment.baseManeuverPenalty}
            subtitle={t('base-maneuver-penalty')}
            image={`/static/images/generic/maneuver-penalty.png`}
          />
          <TextCard
            value={t(`difficulty-${character.equipment.movementBaseDifficulty}`)}
            subtitle={t('movement-base-difficulty')}
            image={`/static/images/generic/maneuver-penalty.png`}
          />
          <NumericCard
            value={character.equipment.rangedPenalty}
            subtitle={t('ranged-penalty')}
            image={`/static/images/generic/armor-ranged-penalty.png`}
          />
          <NumericCard
            value={character.equipment.perceptionPenalty}
            subtitle={t('perception-penalty')}
            image={`/static/images/generic/armor-perception-penalty.png`}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default CharacterViewEquipmentInfo;
