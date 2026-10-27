import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { TextField } from '@mui/material';
import {
  fetchEnumerations,
  fetchRaces,
  fetchSkillCategories,
  fetchSkills,
  LoadingState,
  REALM_TYPES,
  RmuSelect,
  Skill,
  STATS,
  Trait,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const COMBAT_SKILL_CATEGORY = 'combat-training';

const SKILL_SPECIALIZATIONS = ['skill', 'combat-skill', 'melee-combat-skill', 'ranged-combat-skill'];

/** Combat skills offered for a melee or ranged specialization: ranged skills are the ones whose id starts with `ranged`. */
const filterCombatSkills = (skills: Skill[], specialization: string): Skill[] => {
  if (specialization === 'melee-combat-skill') return skills.filter((skill) => !skill.id.startsWith('ranged'));
  if (specialization === 'ranged-combat-skill') return skills.filter((skill) => skill.id.startsWith('ranged'));
  return skills;
};

/** Free text specialization (life goal, phobia, vow...) of the Character Companion traits (spec 039). */
const TEXT_SPECIALIZATION = 'text';

/**
 * Values a trait specialization can take: the stat keys for `stat`, the realms for `realm`, the skills of the core
 * catalog for the skill kinds (only the combat-training ones for the combat kinds), the skill categories, the race
 * names, and the enumerations of the category for the rest (weapon types, senses, languages...).
 */
const loadSpecializations = async (specialization: string, auth: ReturnType<typeof useAuth>): Promise<string[]> => {
  if (specialization === 'stat') return [...STATS];
  if (specialization === 'realm') return [...REALM_TYPES];
  if (specialization === 'skill-category') {
    const response = await fetchSkillCategories('', 0, 100, auth);
    return response.content.map((category) => category.id);
  }
  if (specialization === 'race') {
    const response = await fetchRaces('', 0, 100, auth);
    return response.content.map((race) => race.name);
  }
  if (SKILL_SPECIALIZATIONS.includes(specialization)) {
    const rsql = specialization === 'skill' ? '' : `categoryId==${COMBAT_SKILL_CATEGORY}`;
    const response = await fetchSkills(rsql, 0, 500, auth);
    return filterCombatSkills(response.content, specialization).map((skill) => skill.id);
  }
  const response = await fetchEnumerations(`category==${specialization}`, 0, 100, auth);
  return response.content.map((e) => e.key);
};

const SelectTraitSpecialization: FC<{
  value: any;
  trait: Trait;
  onChange: (value: string) => void;
}> = ({ value, trait, onChange }) => {
  const auth = useAuth();
  const notify = useNotify();
  const { t } = useTranslation();
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  useEffect(() => {
    if (!trait?.specialization || trait.specialization === TEXT_SPECIALIZATION) return;
    setAvailableSpecializations(undefined);
    loadSpecializations(trait.specialization, auth)
      .then((options) => setAvailableSpecializations(options))
      .catch((err) => notify.error(err));
  }, [trait?.specialization]);

  if (!trait) return null;

  if (trait.specialization === TEXT_SPECIALIZATION) {
    return (
      <TextField label={t('specialization')} value={value || ''} onChange={(e) => onChange(e.target.value)} fullWidth />
    );
  }

  if (!availableSpecializations) return <LoadingState />;

  return (
    <RmuSelect
      label={t('specialization')}
      value={value}
      options={availableSpecializations}
      onChange={(e) => onChange(e)}
    />
  );
};

export default SelectTraitSpecialization;
