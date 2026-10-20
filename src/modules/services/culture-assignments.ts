import { Culture, CultureAssignmentDto, CultureSkillRank, Skill } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * Client-side mirror of the culture validation of rmu-api-strategic (culture-ranks.resolver): every entry that is not
 * of type 'skill' is distributed by the player, its ranks must add up exactly to the entry ranks, the skill must match
 * the entry type, a specialization is required when the skill has one (always for languages and regions), languages
 * are limited to culture.languages when it is not empty, and maxRanksPerSkill applies per skill and specialization.
 */

export const LANGUAGE_SKILL_IDS = ['language-spoken', 'language-written'];
export const DEFAULT_CULTURE_MAX_RANKS_PER_SKILL = 2;

/** One row of the distribution form. `key` only identifies the row in the UI. */
export interface CultureAssignmentRow {
  key: number;
  entry: number;
  skillId: string;
  specialization: string;
  ranks: number;
}

export type CultureErrorCode =
  | 'err-culture-incomplete-entry'
  | 'err-culture-wrong-skill'
  | 'err-culture-max-ranks-per-skill'
  | 'err-culture-missing-specialization'
  | 'err-culture-language-not-offered'
  | 'err-culture-invalid-entry';

export interface CultureEntryValidation {
  /** Ranks still to assign (negative when too many are assigned). */
  pending: number;
  errors: CultureErrorCode[];
  rowErrors: Record<number, CultureErrorCode | undefined>;
}

/** Whether the player distributes the entry ranks ('skill' entries are applied automatically). */
export const isAssignable = (entry: CultureSkillRank): boolean => entry.type !== 'skill';

export const maxRanksPerSkill = (entry: CultureSkillRank): number => {
  if (entry.maxRanksPerSkill !== undefined && entry.maxRanksPerSkill !== null) return entry.maxRanksPerSkill;
  return entry.type === 'skill-choice' || entry.type === 'category-pool'
    ? DEFAULT_CULTURE_MAX_RANKS_PER_SKILL
    : Number.POSITIVE_INFINITY;
};

/** Skills an entry accepts, from the skill catalog. */
export const entrySkillOptions = (entry: CultureSkillRank, skills: Skill[]): Skill[] => {
  switch (entry.type) {
    case 'skill-choice': {
      const allowed = entry.skillIds?.length ? entry.skillIds : entry.skillId ? [entry.skillId] : [];
      return skills.filter((s) => allowed.includes(s.id));
    }
    case 'category-pool':
      return skills.filter((s) => (entry.categoryIds || []).includes(s.categoryId));
    case 'languages':
      return skills.filter((s) => LANGUAGE_SKILL_IDS.includes(s.id));
    case 'region':
      return skills.filter((s) => s.id === entry.skillId);
    default:
      return [];
  }
};

/** Languages and regions always take a specialization; other skills when the catalog says so. */
export const requiresSpecialization = (entry: CultureSkillRank, skill: Skill | undefined): boolean =>
  entry.type === 'languages' || entry.type === 'region' || !!skill?.specialization;

/** The first row of an entry: the skill is preset when the entry offers only one. */
export const initialRow = (
  entry: CultureSkillRank,
  index: number,
  key: number,
  skills: Skill[]
): CultureAssignmentRow => {
  const options = entrySkillOptions(entry, skills);
  const skillId = entry.type === 'region' ? entry.skillId || '' : options.length === 1 ? options[0].id : '';
  return {
    key,
    entry: index,
    skillId,
    specialization: '',
    ranks: Math.min(entry.ranks, maxRanksPerSkill(entry)),
  };
};

const rowKey = (row: CultureAssignmentRow) => `${row.skillId}#${row.specialization.trim()}`;

export const validateCultureEntry = (
  culture: Culture,
  index: number,
  rows: CultureAssignmentRow[],
  skills: Skill[]
): CultureEntryValidation => {
  const entry = culture.skillRanks[index];
  const entryRows = rows.filter((r) => r.entry === index);
  const assigned = entryRows.reduce((sum, r) => sum + (r.ranks || 0), 0);
  const result: CultureEntryValidation = { pending: entry.ranks - assigned, errors: [], rowErrors: {} };
  if (assigned !== entry.ranks) result.errors.push('err-culture-incomplete-entry');

  const options = entrySkillOptions(entry, skills);
  const max = maxRanksPerSkill(entry);
  const perSkill = new Map<string, number>();
  entryRows.forEach((row) => {
    perSkill.set(rowKey(row), (perSkill.get(rowKey(row)) || 0) + (row.ranks || 0));
  });
  entryRows.forEach((row) => {
    const skill = options.find((s) => s.id === row.skillId);
    let error: CultureErrorCode | undefined;
    if (!Number.isInteger(row.ranks) || row.ranks < 1) error = 'err-culture-invalid-entry';
    else if (!skill) error = 'err-culture-wrong-skill';
    else if (requiresSpecialization(entry, skill) && !row.specialization.trim())
      error = 'err-culture-missing-specialization';
    else if (
      entry.type === 'languages' &&
      culture.languages?.length &&
      !culture.languages.includes(row.specialization.trim())
    )
      error = 'err-culture-language-not-offered';
    else if ((perSkill.get(rowKey(row)) || 0) > max) error = 'err-culture-max-ranks-per-skill';
    result.rowErrors[row.key] = error;
    if (error && !result.errors.includes(error)) result.errors.push(error);
  });
  return result;
};

/** Validation of every assignable entry, by entry index. */
export const validateCulture = (
  culture: Culture | undefined,
  rows: CultureAssignmentRow[],
  skills: Skill[]
): Record<number, CultureEntryValidation> => {
  const result: Record<number, CultureEntryValidation> = {};
  culture?.skillRanks.forEach((entry, index) => {
    if (isAssignable(entry)) result[index] = validateCultureEntry(culture, index, rows, skills);
  });
  return result;
};

export const isCultureValid = (validation: Record<number, CultureEntryValidation>): boolean =>
  Object.values(validation).every((v) => v.errors.length === 0);

/** Assignments of the create character request. */
export const toAssignments = (
  culture: Culture,
  rows: CultureAssignmentRow[],
  skills: Skill[]
): CultureAssignmentDto[] =>
  rows
    .filter((row) => culture.skillRanks[row.entry] && isAssignable(culture.skillRanks[row.entry]) && row.ranks > 0)
    .map((row) => {
      const entry = culture.skillRanks[row.entry];
      const skill = skills.find((s) => s.id === row.skillId);
      const specialization = requiresSpecialization(entry, skill) ? row.specialization.trim() : '';
      return {
        entry: row.entry,
        skillId: row.skillId,
        ...(specialization ? { specialization } : {}),
        ranks: row.ranks,
      };
    });
