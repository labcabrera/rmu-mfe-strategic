import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Divider, Stack } from '@mui/material';
import {
  Character,
  CharacterSkill,
  formatBonus,
  PreviewDrawer,
  SituationalSenseTraits,
  SituationalTalentBonuses,
  skillCategoryOf,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { Row } from '../sections/CharacterPanels';

/**
 * Side panel with how a skill's total bonus adds up. On Perception and Tracking it also lists the sense traits of the
 * character, which apply in the roll and not in the total (workspace spec 076, C8), and on any skill the situational
 * talents the game master ticks on the maneuver (workspace spec 079, D3).
 */
export default function CharacterSkillBreakdown({
  skill,
  traits,
  onClose,
}: {
  skill: CharacterSkill | null;
  traits?: Character['traits'];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  // Spec 050: specializations are catalog keys shown by their name
  const specializationLabel = useSpecializationLabel();
  return (
    <PreviewDrawer
      open={Boolean(skill)}
      onClose={onClose}
      title={skill ? t(skill.skillId) : undefined}
      subtitle={
        skill
          ? [t(skillCategoryOf(skill) ?? 'skill'), skill.specialization && specializationLabel(skill.specialization)]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
    >
      {skill && (
        <Stack>
          <Row label={t('ranks')} value={skill.ranks} />
          {(skill.cultureRanks ?? 0) > 0 && <Row label={t('culture-ranks')} value={skill.cultureRanks ?? 0} />}
          {(skill.talentRanks ?? 0) > 0 && <Row label={t('talent-ranks')} value={skill.talentRanks ?? 0} />}
          <Row label={t('stats')} value={skill.statistics.map((stat) => stat.toUpperCase()).join('/')} />
          <Divider sx={{ my: 1 }} />
          <Row label={t('stat')} value={formatBonus(skill.statBonus)} />
          <Row label={t('racial')} value={formatBonus(skill.racialBonus)} />
          <Row label={t('profession')} value={formatBonus(skill.professionalBonus)} />
          <Row label={t('developed-ranks')} value={formatBonus(skill.developmentBonus)} />
          <Row label={t('trait-bonus')} value={formatBonus(skill.traitBonus ?? 0)} />
          <Row label={t('custom')} value={formatBonus(skill.customBonus)} />
          <Divider sx={{ my: 1 }} />
          <Row label={t('total')} value={formatBonus(skill.totalBonus)} />
          <Box sx={{ mt: 1 }}>
            <SituationalSenseTraits skill={skill} traits={traits} />
            <SituationalTalentBonuses skill={skill} traits={traits} />
          </Box>
        </Stack>
      )}
    </PreviewDrawer>
  );
}
