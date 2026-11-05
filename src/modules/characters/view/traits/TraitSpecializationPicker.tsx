import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { TextField } from '@mui/material';
import {
  fetchEnumerations,
  fetchRaces,
  fetchSkillCategories,
  fetchSkills,
  fetchSpellLists,
  ELEMENTS,
  EnumPicker,
  LoadingState,
  REALM_TYPES,
  Skill,
  SPELL_LIST_CATALOG_MAX,
  SpellList,
  SpellListPicker,
  STATS,
  Trait,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const COMBAT_SKILL_CATEGORY = 'combat-training';

/** Specialization of Elemental Resistance and Susceptibility (workspace spec 079, D4). */
const ELEMENTAL_TYPE = 'elemental-type';

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
 * Talents taken for a spell list (Perfected Technique, Quick-Caster, Spatial Skills...; workspace spec 077): core has no
 * `spell-list` enumeration, so the lists of rmu-api-spells are offered and the list code is stored, the one tactical
 * matches with the `listCode` of a cast. Lists without a code (made by users) cannot be matched and are left out.
 */
const SPELL_LIST_SPECIALIZATION = 'spell-list';

const SpellListSpecializationPicker: FC<{ value: string | null; onChange: (code: string) => void }> = ({
  value,
  onChange,
}) => {
  const auth = useAuth();
  const notify = useNotify();
  const [lists, setLists] = useState<SpellList[]>();

  useEffect(() => {
    fetchSpellLists('', 0, SPELL_LIST_CATALOG_MAX, auth)
      .then((page) => setLists(page.content.filter((list) => !!list.code)))
      .catch((err) => notify.error(err));
  }, []);

  if (!lists) return <LoadingState />;

  return (
    <SpellListPicker
      spellLists={lists}
      variant="select"
      value={lists.find((list) => list.code === value)?.id ?? null}
      onChange={(_, list) => list?.code && onChange(list.code)}
    />
  );
};

/**
 * Values a trait specialization can take: the stat keys for `stat`, the realms for `realm`, the elements for
 * `elemental-type`, the skills of the core
 * catalog for the skill kinds (only the combat-training ones for the combat kinds), the skill categories, the race
 * names, and the enumerations of the category for the rest (weapon types, senses, languages...).
 */
const loadSpecializations = async (specialization: string, auth: ReturnType<typeof useAuth>): Promise<string[]> => {
  if (specialization === 'stat') return [...STATS];
  if (specialization === 'realm') return [...REALM_TYPES];
  // Workspace spec 079, D4: core has no `elemental-type` enumeration; the elements tactical reads (i18n `element-<id>`)
  if (specialization === ELEMENTAL_TYPE) return [...ELEMENTS];
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

const TraitSpecializationPicker: FC<{
  value: any;
  trait: Trait;
  onChange: (value: string) => void;
}> = ({ value, trait, onChange }) => {
  const auth = useAuth();
  const notify = useNotify();
  const { t } = useTranslation();
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();

  useEffect(() => {
    if (
      !trait?.specialization ||
      trait.specialization === TEXT_SPECIALIZATION ||
      trait.specialization === SPELL_LIST_SPECIALIZATION
    )
      return;
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

  if (trait.specialization === SPELL_LIST_SPECIALIZATION) {
    return <SpellListSpecializationPicker value={value || null} onChange={onChange} />;
  }

  if (!availableSpecializations) return <LoadingState />;

  return (
    <EnumPicker
      label={t('specialization')}
      value={value || null}
      values={availableSpecializations}
      labelPrefix={trait.specialization === ELEMENTAL_TYPE ? 'element-' : undefined}
      onChange={(specialization) => specialization && onChange(specialization)}
    />
  );
};

export default TraitSpecializationPicker;
