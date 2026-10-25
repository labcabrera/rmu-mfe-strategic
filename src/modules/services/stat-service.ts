import type { RollSpec } from '@labcabrera-rmu/rmu-react-shared-lib';

export const getStatBonus = (temporary: number) => {
  switch (temporary) {
    case 1:
      return -15;
    case 2:
      return -14;
    case 3:
      return -13;
    case 4:
      return -12;
    case 5:
      return -11;
    case 6:
      return -10;
    case 7:
    case 8:
      return -9;
    case 9:
    case 10:
    case 11:
      return -8;
    case 12:
    case 13:
    case 14:
      return -7;
    case 15:
    case 16:
    case 17:
      return -6;
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
      return -5;
    case 24:
    case 25:
    case 26:
    case 27:
    case 28:
    case 29:
      return -4;
    case 30:
    case 31:
    case 32:
    case 33:
    case 34:
    case 35:
      return -3;
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
      return -2;
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
      return -1;
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
      return 0;
    case 54:
    case 55:
    case 56:
    case 57:
    case 58:
    case 59:
      return 1;
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 65:
      return 2;
    case 66:
    case 67:
    case 68:
    case 69:
    case 70:
    case 71:
      return 3;
    case 72:
    case 73:
    case 74:
    case 75:
    case 76:
    case 77:
      return 4;
    case 78:
    case 79:
    case 80:
    case 81:
    case 82:
    case 83:
      return 5;
    case 84:
    case 85:
    case 86:
      return 6;
    case 87:
    case 88:
    case 89:
      return 7;
    case 90:
    case 91:
    case 92:
      return 8;
    case 93:
    case 94:
      return 9;
    case 95:
      return 10;
    case 96:
      return 11;
    case 97:
      return 12;
    case 98:
      return 13;
    case 99:
      return 14;
    case 100:
      return 15;
    default:
      throw new Error('Temporary value out of range (1-100)');
  }
};

/** Bonus of a stat value, 0 for values out of the 1-100 range (stats not rolled yet). */
export const safeStatBonus = (value: number | undefined): number =>
  value && value >= 1 && value <= 100 ? getStatBonus(value) : 0;

export interface StatGainRoll {
  /** Die label, for example 'd10' or 'd3 - 1'. */
  dice: string;
  min: number;
  max: number;
  /** The die as a roll, for the roll field and the random gain. */
  spec: RollSpec;
}

const gainDie = (sides: number, modifier = 0): StatGainRoll => ({
  dice: modifier ? `d${sides} - ${-modifier}` : `d${sides}`,
  min: 1 + modifier,
  max: sides + modifier,
  spec: { dice: 1, sides, openEnded: 'none', ...(modifier ? { modifier } : {}) },
});

/** Die of a stat gain roll by the current temporary value (the API validates the same bands). */
export const getStatGainRoll = (temporary: number): StatGainRoll => {
  if (temporary < 7) return gainDie(3, -1);
  if (temporary < 9) return gainDie(3);
  if (temporary < 19) return gainDie(6);
  if (temporary < 82) return gainDie(10);
  if (temporary < 91) return gainDie(6);
  if (temporary < 93) return gainDie(3);
  return gainDie(3, -1);
};

export interface StatBonusBand {
  bonus: number;
  min: number;
  max: number;
}

/** Ranges of stat values that share a bonus, from the lowest bonus to the highest. */
export const STAT_BONUS_BANDS: StatBonusBand[] = Array.from({ length: 100 }, (_, i) => i + 1).reduce<StatBonusBand[]>(
  (bands, value) => {
    const bonus = getStatBonus(value);
    const last = bands[bands.length - 1];
    if (last && last.bonus === bonus) last.max = value;
    else bands.push({ bonus, min: value, max: value });
    return bands;
  },
  []
);
