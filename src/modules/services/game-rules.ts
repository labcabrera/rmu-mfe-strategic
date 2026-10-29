import {
  Character,
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
  allowThirdRank: false,
  talentPolicy: 'free',
  bonusDevPointsCapAtCreation: false,
  statGeneration: 'roll',
  openRounds: true,
};

/** Ranks of a skill that can be developed in a single level. */
export const MAX_RANKS_PER_LEVEL = 2;
export const MAX_RANKS_PER_LEVEL_WITH_THIRD_RANK = 3;
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

/** Ranks of a skill the character can develop in a level, by the game's allowThirdRank option. */
export const maxRanksPerLevel = (game?: StrategicGame): number =>
  resolveOptions(game?.options).allowThirdRank ? MAX_RANKS_PER_LEVEL_WITH_THIRD_RANK : MAX_RANKS_PER_LEVEL;

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
