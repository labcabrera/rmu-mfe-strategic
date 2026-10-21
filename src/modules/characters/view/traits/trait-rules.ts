import { Character, CharacterTrait, StrategicGame, TalentPolicy, Trait } from '@labcabrera-rmu/rmu-react-shared-lib';
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
}

/** Character level up to which the character is in creation (the API's isCreationLevel). */
export const isInCreation = (character: Character): boolean => character.experience.level <= 1;

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
  isImprovement: boolean
): { pools: DevPointsPool[]; capBonus: boolean; insufficientKey: string; blockedKey?: string } => {
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
  return { pools: ['normal', 'bonus'], capBonus, insufficientKey: 'trait-reason-not-affordable' };
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
  specialization?: string
): TraitPurchase => {
  const cost = traitCost(trait, tier);
  const current = findOwnedTrait(character, trait.id, specialization);
  const isImprovement = !!current && trait.isTierBased && !!current.tier && !!tier && tier > current.tier;
  const charged = isImprovement ? cost - (current?.cost || 0) : cost;
  const payment: TraitPaymentPreview = { normal: 0, bonus: 0, flaw: 0 };
  const maxTraitCost = resolvePowerLevel(game?.powerLevel).maxTraitCost;
  const result = (pools: DevPointsPool[], available: number, blocked?: TraitBlockReason): TraitPurchase => ({
    cost,
    charged,
    isImprovement,
    pools,
    available,
    payment,
    blocked,
  });

  if (current && !isImprovement) {
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

  const rules = spendingRules(character, game, charged, isImprovement);
  if (rules.blockedKey) return result([], 0, { key: rules.blockedKey });
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
    return result(rules.pools, available, { key: rules.insufficientKey, params: { cost: charged, available } });
  }
  return result(rules.pools, available);
};

/**
 * Tier the dialog proposes for a trait: the next one when the character owns it (and can improve it), the first one
 * otherwise; undefined for traits without tiers.
 */
export const initialTier = (character: Character, trait: Trait, specialization?: string): number | undefined => {
  if (!trait.isTierBased) return undefined;
  const current = findOwnedTrait(character, trait.id, specialization);
  if (!current?.tier) return 1;
  return Math.min(current.tier + 1, trait.maxTier ?? current.tier + 1);
};

/** Whether a trait can be bought at all, judged at the tier the dialog would propose (for the list rows). */
export const evaluateTraitRow = (character: Character, game: StrategicGame | undefined, trait: Trait): TraitPurchase =>
  // Traits with a specialization can be bought again with another one: the row judges a new specialization
  // (owned ones always carry their specialization, so judging it without one never finds them).
  evaluateTraitPurchase(character, game, trait, initialTier(character, trait));

/** Talent policy of the game, with its default. */
export const talentPolicyOf = (game?: StrategicGame): TalentPolicy => resolveOptions(game?.options).talentPolicy;
