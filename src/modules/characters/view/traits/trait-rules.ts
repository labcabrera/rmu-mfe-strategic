import {
  Character,
  CharacterTrait,
  DevPointsPool as PoolChoice,
  StrategicGame,
  TalentPolicy,
  Trait,
  TraitAcquisitionType,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveOptions, resolvePowerLevel } from '../../../services/game-rules';

/*
 * Client side mirror of rmu-api-strategic AddTraitHandler (cost, max cost, talent policy and pools). It only drives
 * hints and the enabled state of the dialog: the API stays authoritative and its err-* codes are shown when it refuses.
 */

export type DevPointsPool = 'normal' | 'bonus' | 'flaw';

/** Points taken from each pool (positive) or, for a flaw, the pool that receives the points it returns. */
export interface TraitPaymentPreview {
  normal: number;
  bonus: number;
  flaw: number;
}

/** Why a trait (or a tier of it) cannot be bought, as an i18n key with its parameters. */
export interface TraitBlockReason {
  key: string;
  params?: Record<string, string | number>;
}

export interface TraitPurchase {
  /** Full cost of the chosen tier (what the max cost rule checks). */
  cost: number;
  /** Points charged now: the full cost, or the difference with the owned tier on an improvement. */
  charged: number;
  isImprovement: boolean;
  /** Pools the points come from (in order), or the pool a flaw feeds. */
  pools: DevPointsPool[];
  /** Points available in those pools. */
  available: number;
  payment: TraitPaymentPreview;
  /** First rule the purchase breaks, if any. */
  blocked?: TraitBlockReason;
  /** The talent policy leaves the player choose the pool that pays it (workspace spec 076, A3). */
  poolChoosable?: boolean;
  /** An owned flaw bought at a lower tier (spec 077, C10): it charges the difference. */
  isLowering?: boolean;
}

/** Options of a purchase that change its cost or what it is allowed to do (spec 077). */
export interface TraitPurchaseOptions {
  /** Restricted trait: half the cost (C12). */
  restricted?: boolean;
  /** The user manages the game: only a game master worsens a flaw (C10). */
  gameMaster?: boolean;
}

/** Pools of a pool choice, in order, as rmu-api-strategic `poolsFor`. */
const poolsOf = (choice: PoolChoice): DevPointsPool[] =>
  choice === 'bonus' ? ['bonus', 'normal'] : choice === 'normal' ? ['normal'] : ['normal', 'bonus'];

/** Character level up to which the character is in creation (the API's isCreationLevel). */
export const isInCreation = (character: Character): boolean => character.experience.level <= 1;

/** Spec 077, C12: a restricted talent costs half rounded up, a restricted flaw half rounded towards 0 (as the API). */
export const restrictedCost = (cost: number, isTalent: boolean, restricted: boolean): number => {
  if (!restricted) return cost;
  return isTalent ? Math.ceil(cost / 2) : Math.trunc(cost / 2) || 0;
};

/** Cost of a trait at a tier: the acquisition cost plus the tier cost for each tier above the first. */
export const traitCost = (trait: Trait, tier?: number): number => {
  const base = trait.adquisitionCost || 0;
  if (!trait.isTierBased || !tier || tier <= 1) return base;
  return base + (tier - 1) * (trait.tierCost || 0);
};

/** Trait bought by the character (race traits excluded) with the given specialization. */
export const findOwnedTrait = (
  character: Character,
  traitId: string,
  specialization?: string
): CharacterTrait | undefined =>
  character.traits.find(
    (owned) =>
      owned.source !== 'race' &&
      owned.traitId === traitId &&
      (owned.specialization || undefined) === (specialization || undefined)
  );

/** Every trait of the character with that id (any specialization, race ones included). */
export const ownedTraits = (character: Character, traitId: string): CharacterTrait[] =>
  character.traits.filter((owned) => owned.traitId === traitId);

const bonusAvailable = (character: Character, game: StrategicGame | undefined, capBonus: boolean): number => {
  const pool = Math.max(0, character.experience.availableBonusDevPoints || 0);
  if (!capBonus) return pool;
  const cap = resolvePowerLevel(game?.powerLevel).raceDevPointsPerLevel;
  return Math.min(pool, Math.max(0, cap - (character.experience.bonusDevPointsSpentThisLevel || 0)));
};

const availableIn = (
  character: Character,
  game: StrategicGame | undefined,
  pool: DevPointsPool,
  capBonus: boolean
): number => {
  if (pool === 'normal') return Math.max(0, character.experience.availableDevPoints || 0);
  if (pool === 'bonus') return bonusAvailable(character, game, capBonus);
  return Math.max(0, character.experience.flawDevPoints || 0);
};

/** Pools that pay a positive cost under the game's talent policy, or the error code when it cannot be paid at all. */
const spendingRules = (
  character: Character,
  game: StrategicGame | undefined,
  charged: number,
  isImprovement: boolean,
  choice: PoolChoice
): { pools: DevPointsPool[]; capBonus: boolean; insufficientKey: string; blockedKey?: string; choosable?: boolean } => {
  const creation = isInCreation(character);
  const { talentPolicy, bonusDevPointsCapAtCreation } = resolveOptions(game?.options);
  const capBonus = !creation || bonusDevPointsCapAtCreation;
  if (talentPolicy === 'race-points-at-creation') {
    if (creation) {
      return { pools: ['bonus'], capBonus, insufficientKey: 'err-talent-policy-bonus-points-only' };
    }
    if (charged > 0 && !isImprovement) {
      return {
        pools: [],
        capBonus,
        insufficientKey: 'trait-reason-not-affordable',
        blockedKey: 'err-talent-policy-creation-only',
      };
    }
  }
  if (talentPolicy === 'flaw-points-at-creation' && creation) {
    return { pools: ['flaw'], capBonus, insufficientKey: 'err-talent-policy-flaw-points-only' };
  }
  // The player's choice only applies when the policy fixes no pool (spec 076)
  return {
    pools: poolsOf(choice),
    capBonus,
    insufficientKey: choice === 'normal' ? 'err-dev-points-insufficient' : 'trait-reason-not-affordable',
    choosable: true,
  };
};

/**
 * What buying `trait` at `tier` (with `specialization`) means for the character: cost, points charged, pools and the
 * first rule it breaks. An owned tier based trait bought at a higher tier is an improvement that charges the difference.
 */
export const evaluateTraitPurchase = (
  character: Character,
  game: StrategicGame | undefined,
  trait: Trait,
  tier: number | undefined,
  specialization?: string,
  choice: PoolChoice = 'auto',
  options: TraitPurchaseOptions = {}
): TraitPurchase => {
  const current = findOwnedTrait(character, trait.id, specialization);
  // A tier change keeps the restriction the trait has (as the API)
  const cost = restrictedCost(traitCost(trait, tier), trait.isTalent, !!options.restricted || !!current?.restricted);
  const isImprovement = !!current && trait.isTierBased && !!current.tier && !!tier && tier > current.tier;
  // Spec 077, C10: an owned flaw can be lowered, paying the difference
  const isLowering =
    !!current && !trait.isTalent && trait.isTierBased && !!current.tier && !!tier && tier < current.tier;
  const charged = isImprovement || isLowering ? cost - (current?.cost || 0) : cost;
  const payment: TraitPaymentPreview = { normal: 0, bonus: 0, flaw: 0 };
  const maxTraitCost = resolvePowerLevel(game?.powerLevel).maxTraitCost;
  const result = (pools: DevPointsPool[], available: number, blocked?: TraitBlockReason): TraitPurchase => ({
    cost,
    charged,
    isImprovement,
    isLowering,
    pools,
    available,
    payment,
    blocked,
  });

  // Worsening a flaw is for the game master (spec 077, C10)
  if (isImprovement && !trait.isTalent && !options.gameMaster) {
    return result([], 0, { key: 'trait-reason-flaw-worsen-master' });
  }
  if (current && !isImprovement && !isLowering) {
    const canImprove = trait.isTierBased && !!current.tier && current.tier < (trait.maxTier ?? 0);
    const key = canImprove
      ? 'trait-reason-choose-higher-tier'
      : trait.isTierBased
        ? 'trait-reason-owned-max-tier'
        : 'trait-reason-owned';
    return result([], 0, { key, params: { tier: current.tier ?? '' } });
  }
  if (cost > maxTraitCost) {
    return result([], 0, { key: 'trait-reason-max-cost', params: { cost, max: maxTraitCost } });
  }
  // Flaws return points: to the flaw pool at creation under the flaw policy, to the normal points otherwise
  if (charged < 0) {
    const { talentPolicy } = resolveOptions(game?.options);
    const pool: DevPointsPool =
      talentPolicy === 'flaw-points-at-creation' && isInCreation(character) ? 'flaw' : 'normal';
    payment[pool] = charged;
    return result([pool], 0);
  }
  if (charged === 0) return result([], 0);

  const rules = spendingRules(character, game, charged, isImprovement || isLowering, choice);
  if (rules.blockedKey) return result([], 0, { key: rules.blockedKey });
  const withChoice = (purchase: TraitPurchase): TraitPurchase => ({ ...purchase, poolChoosable: !!rules.choosable });
  let remaining = charged;
  let available = 0;
  rules.pools.forEach((pool) => {
    const inPool = availableIn(character, game, pool, rules.capBonus);
    available += inPool;
    const taken = Math.min(inPool, remaining);
    payment[pool] += taken;
    remaining -= taken;
  });
  if (remaining > 0) {
    return withChoice(
      result(rules.pools, available, { key: rules.insufficientKey, params: { cost: charged, available } })
    );
  }
  return withChoice(result(rules.pools, available));
};

/**
 * Tier the dialog proposes for a trait: the next one when the character owns it (and can improve it), the first one
 * otherwise; undefined for traits without tiers.
 */
export const initialTier = (
  character: Character,
  trait: Trait,
  specialization?: string,
  gameMaster = false
): number | undefined => {
  if (!trait.isTierBased) return undefined;
  const current = findOwnedTrait(character, trait.id, specialization);
  if (!current?.tier) return 1;
  // Spec 077, C10: an owned flaw is proposed one tier lower, unless the game master can still worsen it
  const atMax = current.tier >= (trait.maxTier ?? current.tier);
  if (!trait.isTalent && current.tier > 1 && (!gameMaster || atMax)) return current.tier - 1;
  return Math.min(current.tier + 1, trait.maxTier ?? current.tier + 1);
};

/** Whether a trait can be bought at all, judged at the tier the dialog would propose (for the list rows). */
export const evaluateTraitRow = (
  character: Character,
  game: StrategicGame | undefined,
  trait: Trait,
  gameMaster = false
): TraitPurchase =>
  // Traits with a specialization can be bought again with another one: the row judges a new specialization
  // (owned ones always carry their specialization, so judging it without one never finds them).
  evaluateTraitPurchase(
    character,
    game,
    trait,
    initialTier(character, trait, undefined, gameMaster),
    undefined,
    'auto',
    {
      gameMaster,
    }
  );

/** Talent policy of the game, with its default. */
export const talentPolicyOf = (game?: StrategicGame): TalentPolicy => resolveOptions(game?.options).talentPolicy;

// ---------------------------------------------------------------------------------------------------------------
// Workspace spec 077, C11: the optional purchase rules of the game (`talentPurchaseRules`), as rmu-api-strategic
// TalentPurchasePolicy. They only drive hints: the API stays authoritative.
// ---------------------------------------------------------------------------------------------------------------

/** The game applies the purchase rules of talents and flaws. */
export const talentPurchaseRulesOf = (game?: StrategicGame): boolean =>
  resolveOptions(game?.options).talentPurchaseRules;

/** Prerequisites only the game master grants. */
export const MASTER_PREREQUISITES: TraitAcquisitionType[] = ['training', 'milestone'];
const AUTOMATIC_PREREQUISITES: TraitAcquisitionType[] = ['race', 'profession', 'natural', 'skill'];
/** A tier of a talent per 10 ranks of the skill its `skill` prerequisite names. */
export const RANKS_PER_SKILL_TIER = 10;
/** Character Companion 7.0: one loose flaw, worth up to 20 development points. */
export const MAX_LOOSE_FLAW_POINTS = 20;

/** Ids a catalog prerequisite names: the API sends a comma separated text (older typings say an array). */
export const prerequisiteValues = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value.map(String) : typeof value === 'string' ? value.split(',') : [];
  return raw.map((entry) => entry.trim()).filter(Boolean);
};

/** Ranks in a skill given as `skillId` (its best specialization) or `skillId@specialization`. */
const skillRanks = (character: Character, value: string | undefined): number => {
  if (!value) return 0;
  const [skillId, specialization] = value.split('@');
  return character.skills
    .filter((skill) => skill.skillId === skillId && (!specialization || skill.specialization === specialization))
    .reduce((max, skill) => Math.max(max, skill.ranks || 0), 0);
};

/** How a new tier would be acquired: the prerequisite met, or none. */
export interface TierAcquisition {
  tier: number;
  type?: TraitAcquisitionType;
  value?: string;
}

/**
 * The prerequisite each new tier (after the owned one, up to `toTier`) meets, as the API tries them: race, profession,
 * natural (at creation) and skill (a tier per 10 ranks, counting the tiers already acquired by skill); training and
 * milestone only when the game master chooses them. Empty when the talent has no prerequisites.
 */
export const evaluatePrerequisites = (
  character: Character,
  trait: Trait,
  toTier: number | undefined,
  specialization?: string,
  chosen?: TraitAcquisitionType
): TierAcquisition[] => {
  const prerequisites = trait.prerequisites ?? [];
  const current = findOwnedTrait(character, trait.id, specialization);
  const fromTier = current ? (current.tier ?? 1) : 0;
  const target = toTier ?? 1;
  if (!trait.isTalent || target <= fromTier || prerequisites.length === 0) return [];
  let skillTiersUsed = (current?.acquiredBy ?? []).filter((entry) => entry.type === 'skill').length;
  const types = chosen ? [chosen] : AUTOMATIC_PREREQUISITES;
  const result: TierAcquisition[] = [];
  for (let tier = fromTier + 1; tier <= target; tier++) {
    let found: TierAcquisition | undefined;
    for (const type of types) {
      for (const prerequisite of prerequisites.filter((entry) => entry.type === type)) {
        const values = prerequisiteValues(prerequisite.value);
        if (type === 'training' || type === 'milestone') found = { tier, type };
        else if (type === 'natural' && isInCreation(character)) found = { tier, type };
        else if (type === 'profession' && values.includes(character.info.professionId)) {
          found = { tier, type, value: character.info.professionId };
        } else if (type === 'race' && values.includes(character.info.race.id)) {
          found = { tier, type, value: character.info.race.id };
        } else if (type === 'skill') {
          const skill = values[0] ?? specialization;
          const allowed = Math.floor(skillRanks(character, skill) / RANKS_PER_SKILL_TIER);
          if (skill && skillTiersUsed < allowed) {
            skillTiersUsed++;
            found = { tier, type, value: skill };
          }
        }
        if (found) break;
      }
      if (found) break;
    }
    result.push(found ?? { tier });
  }
  return result;
};

/** Talents of the character a flaw can be linked to: those whose catalog lists it among their Possible Flaws. */
export const linkableTalents = (character: Character, flaw: Trait, catalog: Map<string, Trait>): CharacterTrait[] =>
  flaw.isTalent
    ? []
    : character.traits.filter(
        (owned) => owned.isTalent && (catalog.get(owned.traitId)?.possibleFlaws ?? []).includes(flaw.id)
      );

/** Flaws of the character linked to a talent. */
export const linkedFlaws = (character: Character, talent: CharacterTrait): CharacterTrait[] =>
  character.traits.filter(
    (owned) =>
      !owned.isTalent &&
      owned.linkedTo?.traitId === talent.traitId &&
      (owned.linkedTo?.specialization || undefined) === (talent.specialization || undefined)
  );

/**
 * Why a new flaw cannot be taken under the purchase rules: linked, its talent's linked flaws worth at most the cost of
 * the talent; loose, one only and up to -20 (as the API checks).
 */
export const flawLimitReason = (
  character: Character,
  flaw: Trait,
  specialization: string | undefined,
  cost: number,
  link: CharacterTrait | undefined,
  rulesOn: boolean
): TraitBlockReason | undefined => {
  if (flaw.isTalent) return undefined;
  const isSelf = (owned: CharacterTrait) =>
    owned.traitId === flaw.id && (owned.specialization || undefined) === (specialization || undefined);
  if (link) {
    const total =
      linkedFlaws(character, link)
        .filter((owned) => !isSelf(owned))
        .reduce((sum, owned) => sum + Math.abs(owned.cost), 0) + Math.abs(cost);
    if (total > Math.abs(link.cost)) {
      return { key: 'err-flaw-linked-exceeds' };
    }
    return undefined;
  }
  if (!rulesOn) return undefined;
  if (Math.abs(cost) > MAX_LOOSE_FLAW_POINTS) return { key: 'err-flaw-limit' };
  const loose = character.traits.filter(
    (owned) => owned.source !== 'race' && !owned.isTalent && !owned.linkedTo && !isSelf(owned)
  );
  return loose.length > 0 ? { key: 'err-flaw-limit' } : undefined;
};
