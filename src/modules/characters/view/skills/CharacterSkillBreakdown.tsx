import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Stack } from '@mui/material';
import { CharacterSkill, formatBonus, PreviewDrawer } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Row } from '../sections/CharacterPanels';

/** Side panel with how a skill's total bonus adds up. */
export default function CharacterSkillBreakdown({
  skill,
  onClose,
}: {
  skill: CharacterSkill | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <PreviewDrawer
      open={Boolean(skill)}
      onClose={onClose}
      title={skill ? t(skill.skillId) : undefined}
      subtitle={
        skill
          ? [t(skill.category ?? 'skill'), skill.specialization && t(skill.specialization)].filter(Boolean).join(' · ')
          : undefined
      }
    >
      {skill && (
        <Stack>
          <Row label={t('ranks')} value={skill.ranks} />
          <Row label={t('stats')} value={skill.statistics.map((stat) => stat.toUpperCase()).join('/')} />
          <Divider sx={{ my: 1 }} />
          <Row label={t('stat')} value={formatBonus(skill.statBonus)} />
          <Row label={t('racial')} value={formatBonus(skill.racialBonus)} />
          <Row label={t('profession')} value={formatBonus(skill.professionalBonus)} />
          <Row label={t('developed-ranks')} value={formatBonus(skill.developmentBonus)} />
          <Row label={t('custom')} value={formatBonus(skill.customBonus)} />
          <Divider sx={{ my: 1 }} />
          <Row label={t('total')} value={formatBonus(skill.totalBonus)} />
        </Stack>
      )}
    </PreviewDrawer>
  );
}
