import {
  CastSupport,
  Character,
  HealingTables,
  HealingType,
  Injury,
  KeyValue,
  resolveHealer,
  RollModifier,
  TreatInjuryDto,
  TreatmentDifficulty,
  TreatmentProcedure,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  ALL_PROCEDURES,
  bodyDevelopmentRanks,
  DEFAULT_SALVE_RANGE,
  HealingOption,
  healingTypeKey,
  healingTypeOf,
  isProcedureAllowed,
  isRecoveryRolled,
  isTreatable,
  latestTreatment,
  suggestedProcedures,
  SURGERY_ONLY_PROCEDURES,
} from './health-rules';

/** Rules of the healing dialog: the previews and the requests. The API stays authoritative. */

export type TreatmentDifficulties = Partial<Record<TreatmentProcedure, TreatmentDifficulty>>;

/** A healer chosen in the picker, either a character of the game or someone typed in. */
export type ResolvedHealer = NonNullable<ReturnType<typeof resolveHealer>>;

/** The procedures that fit the injury: the suggestions (or all), without the ones the API refuses or has no row for. */
export const availableProcedures = (
  injury: Injury,
  showAll: boolean,
  difficulties: TreatmentDifficulties,
  surgeryOnly: boolean
): TreatmentProcedure[] => {
  // An injury that requires surgery only admits surgery or magic, whatever the API difficulty says.
  if (surgeryOnly) return SURGERY_ONLY_PROCEDURES;
  return (showAll ? ALL_PROCEDURES : suggestedProcedures(injury)).filter(
    (option) => isProcedureAllowed(injury, option) && difficulties[option]?.applicable !== false
  );
};

/** The procedure the dialog proposes when it opens on an injury. */
export const firstProcedure = (injury: Injury): TreatmentProcedure =>
  suggestedProcedures(injury).find((option) => isProcedureAllowed(injury, option)) ?? 'dress';

/** The type of healing once the procedure changes: magic and herbs set it, and leaving them goes back to medicine. */
export const healingOptionAfter = (next: TreatmentProcedure, current: HealingOption): HealingOption => {
  if (next === 'magic') return 'magic';
  if (next === 'herbs') return 'herbs';
  return current === 'magic' || current === 'herbs' ? 'medicine' : current;
};

export const usesHerbs = (procedure: TreatmentProcedure, option: HealingOption): boolean =>
  procedure === 'herbs' || option === 'herbs' || option === 'magic-and-herbs';

/** Bonuses of a herb applied in the treatment, for its hint. */
export const herbBonuses = (option: HealingOption): { medicine: number; recovery: number } => ({
  medicine: 25,
  recovery: option === 'magic-and-herbs' ? 75 : 50,
});

export interface ResolvedDifficulty {
  extra: number;
  value?: number;
  grade: string;
  overridden: boolean;
}

/** The API difficulty of the procedure; a game master override replaces its grade, the bleeding extra still applies. */
export const resolveDifficulty = (computed?: TreatmentDifficulty, override?: KeyValue): ResolvedDifficulty => {
  const extra = computed?.bleedingModifier ?? 0;
  return {
    extra,
    value: override ? override.value + extra : computed?.difficulty,
    grade: override?.key ?? computed?.grade ?? '',
    overridden: !!override && override.value !== computed?.base,
  };
};

/** Treatment preview: roll + Medicine bonus + healer penalties + difficulty. Undefined for magic or no difficulty. */
export const treatmentPreview = (
  isMagic: boolean,
  roll: number | null,
  medicine: number | undefined,
  healerPenalty: number,
  difficulty: number | undefined
): number | undefined =>
  isMagic || difficulty === undefined ? undefined : (roll ?? 0) + (medicine ?? 0) + healerPenalty + difficulty;

export interface TreatmentReadiness {
  hasHealer: boolean;
  isMagic: boolean;
  procedure: TreatmentProcedure;
  roll: number | null;
  salveInRange: boolean;
  herbalismEnabled: boolean;
  herbalismRoll: number | null;
}

/** All that the treatment request needs is filled in. */
export const isTreatmentReady = (injury: Injury, input: TreatmentReadiness): boolean =>
  input.hasHealer &&
  isTreatable(injury) &&
  (input.isMagic || input.roll !== null) &&
  (input.procedure !== 'salve' || input.salveInRange) &&
  (!input.herbalismEnabled || input.herbalismRoll !== null);

export interface TreatmentRequest {
  procedure: TreatmentProcedure;
  healingOption: HealingOption;
  healer: ResolvedHealer;
  difficulty: ResolvedDifficulty;
  roll: number | null;
  herbItemId: string;
  castSupport: CastSupport;
  salveModifier: number;
  herbalismEnabled: boolean;
  herbalismRoll: number | null;
  askCastSupport: boolean;
}

/** The request of a treatment: only the override of the game master is sent, otherwise the API computes the difficulty. */
export const buildTreatmentDto = (request: TreatmentRequest): TreatInjuryDto => {
  const { procedure, healingOption, healer, difficulty, roll, herbItemId } = request;
  const isMagic = procedure === 'magic';
  return {
    procedure,
    ...(difficulty.overridden && difficulty.value !== undefined ? { difficulty: difficulty.value } : {}),
    healingType: healingTypeOf(healingOption),
    ...(isMagic ? {} : { roll: roll ?? undefined }),
    ...(healer.characterId
      ? { healerCharacterId: healer.characterId }
      : {
          healer: {
            name: healer.name,
            bonus: healer.medicine,
            herbalismBonus: healer.herbalism,
          },
        }),
    ...(usesHerbs(procedure, healingOption) && herbItemId ? { herbItemId } : {}),
    ...(request.askCastSupport ? { castSupport: request.castSupport } : {}),
    ...(procedure === 'salve' ? { salveModifier: request.salveModifier } : {}),
    ...(request.herbalismEnabled && request.herbalismRoll !== null
      ? {
          herbalism: healer.characterId
            ? { roll: request.herbalismRoll, healerCharacterId: healer.characterId }
            : { roll: request.herbalismRoll, bonus: healer.herbalism },
        }
      : {}),
  };
};

/** Salve modifier range of the core tables, or the default when they have none. */
export const salveRangeOf = (tables: HealingTables | undefined) => tables?.salveModifier ?? DEFAULT_SALVE_RANGE;

export interface RecoveryPreview {
  modifiers: RollModifier[];
  /** Undefined while the healing tables are not available. */
  healingTypeModifier?: number;
}

/** Spec 052: the same entries, groups and rules as the API keeps with the recovery. */
export const recoveryPreview = (
  character: Character,
  injury: Injury,
  tables: HealingTables | undefined
): RecoveryPreview => {
  const latest = latestTreatment(injury);
  const healingType: HealingType = latest?.healingType ?? 'none';
  const partialModifier = latest?.result === 'partial-success' ? latest.recoveryModifier || 0 : 0;
  const healingTypeModifier = tables ? (tables.healingTypeModifiers[healingType] ?? 0) + partialModifier : undefined;
  const modifiers: RollModifier[] = [
    { key: 'body-development-ranks', value: bodyDevelopmentRanks(character), group: 'skill', rule: '§13.1' },
    { key: 'constitution-bonus', value: character.statistics.co?.totalBonus ?? 0, group: 'skill', rule: '§13.1' },
    ...(healingTypeModifier !== undefined
      ? [
          {
            key: healingTypeKey(healingType),
            value: healingTypeModifier - partialModifier,
            group: 'situation' as const,
            source: 'healing-type',
            rule: 'Table 13-1a',
            params: {
              healingType: `healing-type-${healingType}`,
              ...(latest ? { procedure: `procedure-${latest.procedure}` } : {}),
            },
          },
        ]
      : []),
    ...(healingTypeModifier !== undefined && partialModifier
      ? [{ key: 'partial-success', value: partialModifier, group: 'situation' as const, rule: '§13.1' }]
      : []),
    { key: 'injury-penalty', value: -Math.abs(injury.penalty || 0), group: 'penalty', rule: '§13.1' },
  ];
  return { modifiers, healingTypeModifier };
};

/** One recovery roll per treatment, on an injury of a known type that is not yet permanent. */
export const canRollRecovery = (injury: Injury, dead: boolean): boolean =>
  !dead &&
  !isRecoveryRolled(injury) &&
  injury.type !== 'unknown' &&
  injury.status !== 'permanent' &&
  isTreatable(injury);

/** An untreated recovery always asks for the permanent roll, light injuries too. */
export const canRollPermanent = (injury: Injury, dead: boolean, required: boolean): boolean => {
  const recovery = injury.recovery;
  return !dead && !!recovery && !injury.permanent && (required || injury.severity !== 'light' || !!recovery.untreated);
};
