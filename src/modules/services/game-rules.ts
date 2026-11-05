import {
  Character,
  CharacterSkill,
  DevPointsPool,
  isIntenseTrainingSkill,
  StrategicGame,
  StrategicGameOptions,
  StrategicGamePowerLevel,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Skills of the profession that get the professional bonus (Core Law 2.4: 10 of the 15 of the profession). */
export const MAX_PROFESSIONAL_SKILLS = 10;

/** Power level values the API applies when a game does not set them (Superior power level). */
export const DEFAULT_POWER_LEVEL: Required<StrategicGamePowerLevel> = {
  baseDevPoints: 60,
  statRandomMin: 11,
  statBoostPotential: 78,
  statBoostTemporary: 56,
  statCreationBoost: 2,
  statCreationSwap: 2,
  maxTraitCost: 20,
  raceDevPointsPerLevel: 25,
  creationBonusDevPoints: 0,
  statPoints: 15,
  knackCount: 2,
  knackBonus: 5,
};

export const DEFAULT_OPTIONS: Required<StrategicGameOptions> = {
  experienceMultiplier: 1,
  fatigueMultiplier: 1,
  boardScaleMultiplier: 1,
  letality: 0,
  intenseTraining: false,
  allowSavingDevPoints: false,
  talentPolicy: 'free',
  bonusDevPointsCapAtCreation: false,
  statGeneration: 'roll',
  openRounds: true,
  talentPurchaseRules: false,
};

/** Ranks of a skill that can be developed in a single level without intense training (Core Law §3). */
export const MAX_RANKS_PER_LEVEL = 2;
/** Development points of an extra stat gain roll. */
export const STAT_GAIN_DEV_POINTS_COST = 4;

const withDefaults = <T extends object>(defaults: Required<T>, value: T | undefined): Required<T> => {
  const result = { ...defaults } as Record<string, unknown>;
  Object.entries(value ?? {}).forEach(([key, v]) => {
    if (v !== undefined && v !== null) result[key] = v;
  });
  return result as Required<T>;
};

export const resolvePowerLevel = (powerLevel?: StrategicGamePowerLevel): Required<StrategicGamePowerLevel> =>
  withDefaults(DEFAULT_POWER_LEVEL, powerLevel);

export const resolveOptions = (options?: StrategicGameOptions): Required<StrategicGameOptions> =>
  withDefaults(DEFAULT_OPTIONS, options);

/** The game with every power level and option field filled, so that an update sends full objects. */
export const withGameDefaults = (game: StrategicGame): StrategicGame => ({
  ...game,
  options: resolveOptions(game.options),
  powerLevel: resolvePowerLevel(game.powerLevel),
});

/**
 * Category of the core catalog that holds the lore skills and the languages: core has no separate language category,
 * as in rmu-api-strategic.
 */
const LORE_CATEGORY_ID = 'lore';

/** Lore skills and languages are exempt from the twice the level limit of intense training (spec 076, P2). */
export const isLoreOrLanguage = (skill: Pick<CharacterSkill, 'skillId' | 'categoryId' | 'category'>): boolean => {
  const category = skill.categoryId ?? skill.category;
  if (category) return category === LORE_CATEGORY_ID;
  return skill.skillId.startsWith('language-') || skill.skillId.endsWith('lore');
};

/** Intense training stops at ranks equal to twice the level; level 0 counts as level 1 (one development level). */
export const intenseTrainingLimit = (level: number): number => 2 * Math.max(level, 1);

/** Why the next rank of a skill cannot be developed in this level, by the rules alone (the points apart). */
export type RankBlock =
  'err-skill-max-ranks-per-level' | 'err-skill-intense-training-taken' | 'err-skill-intense-training-limit';

export interface NextRankRule {
  /** The next rank goes beyond two in the level: it needs intense training. */
  intense: boolean;
  blocked?: RankBlock;
}

/**
 * Whether the next rank of the skill can be developed in this level, as rmu-api-strategic decides it (workspace spec
 * 076, A1): two ranks per level; with the game's intense training, one skill per level may take more, unless (lore
 * and languages apart) it already has ranks equal to twice the level.
 */
export const nextRankRule = (character: Character, skill: CharacterSkill, game?: StrategicGame): NextRankRule => {
  if (skill.ranksDeveloped < MAX_RANKS_PER_LEVEL) return { intense: false };
  if (!resolveOptions(game?.options).intenseTraining)
    return { intense: true, blocked: 'err-skill-max-ranks-per-level' };
  const experience = character.experience;
  if (experience.intenseTrainingSkill && !isIntenseTrainingSkill(experience, skill)) {
    return { intense: true, blocked: 'err-skill-intense-training-taken' };
  }
  if (!isLoreOrLanguage(skill) && skill.ranks >= intenseTrainingLimit(experience.level)) {
    return { intense: true, blocked: 'err-skill-intense-training-limit' };
  }
  return { intense: true };
};

/** Cost of the next rank: the first cost for the first rank of the level, the second for every other one. */
export const nextRankCost = (skill: CharacterSkill): number | undefined =>
  skill.development?.[Math.min(skill.ranksDeveloped, skill.development.length - 1, 1)];

/** Bonus development points the character can still spend in this level (pool limited by the per level cap). */
export const spendableBonusDevPoints = (character: Character, game?: StrategicGame): number => {
  const pool = Math.max(0, character.experience.availableBonusDevPoints || 0);
  const cap = resolvePowerLevel(game?.powerLevel).raceDevPointsPerLevel;
  const remaining = Math.max(0, cap - (character.experience.bonusDevPointsSpentThisLevel || 0));
  return Math.min(pool, remaining);
};

/**
 * Development points the character can spend on a rank or an extra stat gain roll: the normal points first and then
 * the bonus points up to the per level limit, as the API does.
 */
export const spendableDevPoints = (character: Character, game?: StrategicGame): number =>
  Math.max(0, character.experience.availableDevPoints || 0) + spendableBonusDevPoints(character, game);

/**
 * Development points the character can spend with a pool (workspace spec 076, A3): only the normal ones with `normal`,
 * every spendable point otherwise (`bonus` changes the order, not the total).
 */
export const spendableDevPointsWith = (character: Character, game: StrategicGame | undefined, pool: DevPointsPool) =>
  pool === 'normal' ? Math.max(0, character.experience.availableDevPoints || 0) : spendableDevPoints(character, game);
