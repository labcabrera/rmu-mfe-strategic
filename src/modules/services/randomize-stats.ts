import { CreateCharacterDto, rollDice, StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { getStatGainRoll, STAT_BONUS_BANDS, StatBonusBand } from './stat-service';

export type CreationStats = CreateCharacterDto['statistics'];

const STAT_MAX = 100;

/** Random integer between min and max, both included. */
export const rollBetween = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/** d100 roll rerolled below the game's statRandomMin. */
export const randomStatValue = (statRandomMin: number): number =>
  rollBetween(Math.min(Math.max(1, statRandomMin || 1), STAT_MAX), STAT_MAX);

/**
 * Rolls every stat: three rolls (each one rerolled below statRandomMin), the highest is the potential and the second
 * one the temporary. Racial bonuses are kept.
 */
export const randomizeStats = (statistics: CreationStats, statRandomMin: number): CreationStats => {
  const result = { ...statistics };
  STATS.forEach((key) => {
    const values = [randomStatValue(statRandomMin), randomStatValue(statRandomMin), randomStatValue(statRandomMin)];
    values.sort((a, b) => b - a);
    result[key] = { ...statistics[key], potential: values[0], temporary: values[1] };
  });
  return result;
};

/** Bonus bands a point-buy temporary can be bought in: the band must start at or below the potential. */
export const pointBuyBands = (potential: number): StatBonusBand[] => STAT_BONUS_BANDS.filter((b) => b.min <= potential);

/** Value bought for a bonus: the highest value of its band, never above the potential. */
export const pointBuyValue = (bonus: number, potential: number): number => {
  const band = STAT_BONUS_BANDS.find((b) => b.bonus === bonus) ?? STAT_BONUS_BANDS[0];
  return Math.max(1, Math.min(band.max, potential));
};

/** Point-buy generation: potentials are rolled and every temporary starts bought at a +0 bonus. */
export const randomizePointBuyStats = (statistics: CreationStats, statRandomMin: number): CreationStats => {
  const rolled = randomizeStats(statistics, statRandomMin);
  const result = { ...rolled };
  STATS.forEach((key) => {
    result[key] = { ...rolled[key], temporary: pointBuyValue(0, rolled[key].potential) };
  });
  return result;
};

/** Sets a stat to the game's average values (statBoostTemporary / statBoostPotential). */
export const boostToAverage = (
  statistics: CreationStats,
  key: StatKey,
  temporary: number,
  potential: number
): CreationStats => ({
  ...statistics,
  [key]: { ...statistics[key], temporary, potential: Math.max(potential, temporary) },
});

/** Stat with the n-th highest temporary value (0 = highest). */
export const rankedStat = (statistics: CreationStats, rank: number): StatKey | undefined =>
  [...STATS].sort((a, b) => statistics[b].temporary - statistics[a].temporary)[rank];

/**
 * Raises the stat with the n-th highest temporary value to the given value (90 for the highest, 85 for the second)
 * and its potential by 10, up to 100 and never below the new temporary.
 */
export const boostRanked = (statistics: CreationStats, rank: number, value: number): CreationStats => {
  const key = rankedStat(statistics, rank);
  if (!key) return statistics;
  const stat = statistics[key];
  const temporary = Math.max(stat.temporary, value);
  const potential = Math.min(STAT_MAX, Math.max(stat.potential + 10, temporary));
  return { ...statistics, [key]: { ...stat, temporary, potential } };
};

/** Applies a stat gain roll: the die depends on the temporary value and the result never exceeds the potential. */
export const applyStatGainRoll = (
  statistics: CreationStats,
  key: StatKey
): { statistics: CreationStats; roll: number } => {
  const stat = statistics[key];
  const die = getStatGainRoll(stat.temporary);
  const roll = rollDice(die.spec).total;
  return {
    statistics: { ...statistics, [key]: { ...stat, temporary: Math.min(stat.potential, stat.temporary + roll) } },
    roll,
  };
};

/** Swaps the potential and temporary values of two stats (racial bonuses stay). */
export const swapStats = (statistics: CreationStats, a: StatKey, b: StatKey): CreationStats => ({
  ...statistics,
  [a]: { ...statistics[a], potential: statistics[b].potential, temporary: statistics[b].temporary },
  [b]: { ...statistics[b], potential: statistics[a].potential, temporary: statistics[a].temporary },
});
