import { ACTIVE_SLEEP_HOURS_PER_DAY, Character, HealingTables, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
// Rest values of spec 013 §4, used only when the healing tables of rmu-api-core cannot be read.
const FALLBACK_HP_PERCENT = 10;
const FALLBACK_PERIOD_HOURS = 2;
const FALLBACK_FULL_REST_MULTIPLIER = 2;
const POWER_PERIOD_HOURS = 2;
const POWER_PERIODS_PER_DAY = 4;

/** What the player asks for in the rest dialog. */
export interface RestInput {
  minutes: number;
  hours: number;
  days: number;
  fullRest: boolean;
  /** The character travels or works: it only recovers in its sleep hours (spec 079, C2). */
  active: boolean;
}

export interface RestRates {
  percent: number;
  periodHours: number;
  fullRestMultiplier: number;
}

export interface RestPreview {
  /** No time asked for: there is nothing to apply. */
  empty: boolean;
  hpAfter: number;
  /** Undefined for a character without power points. */
  powerAfter?: number;
  fatigueBefore: number;
  fatigueAfter: number;
  /** Days counted by the injury counters. */
  counterDays: number;
  /** Injuries in recovery, with the days each one still has after the rest. */
  recovering: { injury: Injury; remainingDays: number }[];
}

/** The rates of the healing tables, or their fallback values while the tables cannot be read. */
export const restRatesOf = (tables: HealingTables | undefined): RestRates => ({
  percent: tables?.restHpPercentPerPeriod ?? FALLBACK_HP_PERCENT,
  periodHours: tables?.restPeriodHours ?? FALLBACK_PERIOD_HOURS,
  fullRestMultiplier: tables?.fullRestDayMultiplier ?? FALLBACK_FULL_REST_MULTIPLIER,
});

/** Same computation as rmu-api-strategic: every hour counts for the hits, whole days for the injury counters. */
export const previewRest = (character: Character, input: RestInput, rates: RestRates): RestPreview => {
  const { minutes, hours, days, fullRest, active } = input;
  const totalHours = hours + days * HOURS_PER_DAY;
  const elapsedDays = days + Math.floor(hours / HOURS_PER_DAY);
  // Spec 079, C2: an active character only sleeps some hours of each whole day, and never rests completely
  const restHours = active ? elapsedDays * ACTIVE_SLEEP_HOURS_PER_DAY : totalHours;
  const periods = Math.floor(restHours / rates.periodHours);
  const { max, current } = character.hp;
  const hpAfter = current >= max ? current : Math.min(max, current + Math.floor((periods * max * rates.percent) / 100));
  const counterDays = elapsedDays * (fullRest && !active ? rates.fullRestMultiplier : 1);
  // Power points (spec 029): per complete period, a limited number of periods a day, as rmu-api-strategic
  const powerPeriods =
    elapsedDays * POWER_PERIODS_PER_DAY +
    (active ? 0 : Math.min(POWER_PERIODS_PER_DAY, Math.floor((hours % HOURS_PER_DAY) / POWER_PERIOD_HOURS)));
  const power = character.power;
  const powerAfter = power
    ? Math.min(power.max, Math.max(power.current, power.current + Math.ceil((power.max * powerPeriods) / 10)))
    : undefined;
  // Spec 077 (§5.5), as rmu-api-strategic: one point of fatigue per minute of the whole rest
  const fatigueBefore = Math.abs(character.endurance?.fatiguePenalty ?? 0);
  const fatigueAfter = Math.max(0, fatigueBefore - (restHours * MINUTES_PER_HOUR + (active ? 0 : minutes)));
  const recovering = (character.injuries || [])
    .filter((injury) => injury.status === 'recovering' && injury.recovery)
    .map((injury) => ({
      injury,
      remainingDays: Math.max(
        0,
        (injury.recovery?.remainingDays ?? 0) - (active && injury.recovery?.untreated ? 0 : counterDays)
      ),
    }));
  return {
    empty: totalHours === 0 && minutes === 0,
    hpAfter,
    powerAfter,
    fatigueBefore,
    fatigueAfter,
    counterDays,
    recovering,
  };
};
