import {
  Character,
  HealingType,
  Injury,
  InjuryStatus,
  KeyValue,
  MANEUVER_DIFFICULTIES,
  TreatmentProcedure,
} from '@labcabrera-rmu/rmu-react-shared-lib';

// UI rules of the Health section (workspace spec 013 §6). The numbers of the healing tables come from rmu-api-core;
// here there are only the procedure suggestions and their difficulty levels (Core Law ch. 13, paraphrased).

export const MEDICINE_SKILL = 'medicine';
export const HERBALISM_SKILL = 'herbalism';
export const BODY_DEVELOPMENT_SKILL = 'body-development';

export const ALL_PROCEDURES: TreatmentProcedure[] = [
  'pressure',
  'stitches',
  'tourniquet',
  'cauterize',
  'dress',
  'splint',
  'cast',
  'salve',
  'surgery',
  'herbs',
  'magic',
];

/** Difficulty key (see MANEUVER_DIFFICULTIES) of each procedure when the injury type does not say otherwise. */
const DEFAULT_DIFFICULTY: Record<TreatmentProcedure, string> = {
  pressure: 'e',
  stitches: 'm',
  tourniquet: 'vh',
  cauterize: 'r',
  dress: 'r',
  splint: 'e',
  cast: 'm',
  salve: 'l',
  surgery: 'sf',
  herbs: 'm',
  magic: 'm',
};

/** Difficulty of a procedure that depends on the injury type. */
const DIFFICULTY_BY_TYPE: Partial<Record<Injury['type'], Partial<Record<TreatmentProcedure, string>>>> = {
  organ: { dress: 'vh', surgery: 'a' },
  'cut-burn': { dress: 'e', surgery: 'xh' },
};

/** Cauterizing is harder for each point of bleeding. */
export const CAUTERIZE_PENALTY_PER_BLEEDING = -5;

/** Procedures that make sense for the injury: its type and severity, the bleeding and the location. */
export const suggestedProcedures = (injury: Injury): TreatmentProcedure[] => {
  const bleeding = (injury.bleeding ?? 0) > 0;
  const severe = injury.severity === 'severe';
  const light = injury.severity === 'light';
  const result: TreatmentProcedure[] = [];
  if (bleeding) {
    result.push('pressure');
    if (!severe) result.push('stitches');
    if (injury.location === 'arm' || injury.location === 'leg') result.push('tourniquet');
    result.push('cauterize');
  }
  switch (injury.type) {
    case 'bone':
    case 'muscle-tendon':
      result.push('splint', 'cast');
      if (severe || injury.type === 'muscle-tendon') result.push('surgery');
      break;
    case 'cut-burn':
      if (!severe) result.push('dress');
      result.push('salve');
      if (!bleeding && !severe) result.push('stitches');
      if (severe) result.push('surgery');
      break;
    case 'organ':
      result.push(light ? 'dress' : 'surgery');
      break;
    case 'skin-tissue':
      result.push('dress');
      break;
    case 'poison-disease':
      result.push('salve');
      break;
    default:
      return ALL_PROCEDURES;
  }
  result.push('herbs', 'magic');
  return ALL_PROCEDURES.filter((procedure) => result.includes(procedure));
};

/** Default difficulty of the procedure on the injury: one step harder on the head. */
export const defaultDifficulty = (injury: Injury, procedure: TreatmentProcedure): KeyValue => {
  const key = DIFFICULTY_BY_TYPE[injury.type]?.[procedure] ?? DEFAULT_DIFFICULTY[procedure];
  const index = MANEUVER_DIFFICULTIES.findIndex((difficulty) => difficulty.key === key);
  const step = injury.location === 'head' ? 1 : 0;
  return MANEUVER_DIFFICULTIES[Math.min(MANEUVER_DIFFICULTIES.length - 1, Math.max(0, index) + step)];
};

/** Extra difficulty of the procedure (cauterizing a bleeding wound). */
export const procedureExtraDifficulty = (injury: Injury, procedure: TreatmentProcedure): number =>
  procedure === 'cauterize' ? CAUTERIZE_PENALTY_PER_BLEEDING * (injury.bleeding ?? 0) : 0;

/** Choice of the type of healing in the treatment step; `medicine` lets the API derive it from the result. */
export type HealingOption = 'medicine' | 'magic' | 'herbs' | 'magic-and-herbs';
export const HEALING_OPTIONS: HealingOption[] = ['medicine', 'magic', 'herbs', 'magic-and-herbs'];

export const healingTypeOf = (option: HealingOption): HealingType | undefined => {
  if (option === 'magic' || option === 'herbs') return 'magic-or-herbs';
  if (option === 'magic-and-herbs') return 'magic-and-herbs';
  return undefined;
};

/** Translation key of a type of healing. */
export const healingTypeKey = (type: HealingType): string => {
  switch (type) {
    case 'medicine':
      return 'healing-medicine-success';
    case 'medicine-absolute':
      return 'healing-medicine-absolute-success';
    case 'magic-or-herbs':
      return 'healing-magic-or-herbalism-success';
    case 'magic-and-herbs':
      return 'healing-magic-and-herbalism-success';
    default:
      return 'none';
  }
};

/** Total bonus of a skill of the character, or undefined when it does not have it. */
export const skillBonus = (character: Character, skillId: string): number | undefined =>
  character.skills.find((skill) => skill.skillId === skillId && !skill.specialization)?.totalBonus ??
  character.skills.find((skill) => skill.skillId === skillId)?.totalBonus;

export const bodyDevelopmentRanks = (character: Character): number =>
  character.skills.find((skill) => skill.skillId === BODY_DEVELOPMENT_SKILL)?.ranks ?? 0;

/** Race recovery multiplier, exposed by rmu-api-strategic in the character info. */
export const recoveryMultiplierOf = (character: Character): number | undefined =>
  character.info.recoveryMultiplier;

/** Latest treatment of the injury, which sets the type of healing of the recovery roll. */
export const latestTreatment = (injury: Injury) =>
  injury.treatments.length > 0 ? injury.treatments[injury.treatments.length - 1] : undefined;

export const INJURY_GROUPS: InjuryStatus[] = ['active', 'recovering', 'permanent', 'healed'];

/** The injury can still be treated (or rolled for recovery). */
export const isTreatable = (injury: Injury): boolean => injury.status === 'active' || injury.status === 'recovering';

/** Active conditions (not resolved). */
export const activeConditions = (character: Character) =>
  (character.conditions || []).filter((condition) => !condition.resolvedAt);
