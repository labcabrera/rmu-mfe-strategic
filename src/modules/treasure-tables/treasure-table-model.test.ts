import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import type { TreasureTablesDto } from '@labcabrera-rmu/rmu-react-shared-lib';
import { buildTreasureTabs, findTreasureTable, rangeLabel, rowAt } from './treasure-table-model';

const t = ((key: string, options?: { max?: number; defaultValue?: string }) =>
  options?.max !== undefined ? `${options.max} or less` : (options?.defaultValue ?? key)) as unknown as TFunction;

// Invented rows with the shape of the API, not the rulebook tables
const quality = <T>(value: T) => ({ 'very-poor': value, poor: value, normal: value, rich: value, 'very-rich': value });
const dto = {
  codes: { wealth: { b: 'poor', a: 'rich' }, lifestyle: {}, magic: {} },
  wealthRolls: [{ min: 1, max: 100, rolls: 2 }],
  wealthValue: [
    { min: -999, max: 0, valueMin: 1, valueMax: 5 },
    { min: 1, max: 999, valueMin: 6, valueMax: 9 },
  ],
  wealthValueModifiers: [{ key: 'fixture', value: 5 }],
  wealthType: [{ min: 1, max: 100, type: 'coins', multiplier: 2 }],
  wealthMultipliers: quality(1),
  jewelryTypes: [{ min: 1, max: 100, itemTypeId: 'ring' }],
  artTypes: [{ min: 1, max: 100, key: 'old-map' }],
  gearQuality: [{ min: 1, max: 100, ...quality({ total: 1, max: null }) }],
  magicTreasure: [{ min: 1, max: 100, ...quality([5, -5]) }],
  magicMaxLevel: quality(null),
  itemType: [{ min: 1, max: 100, table: 'melee' }],
  magicTables: {
    melee: [{ min: 1, max: 300, label: 'Fixture blade', price: { min: 1, max: 2 } }],
    ranged: [],
    armor: [],
    utility: [],
    spell: [],
    charged: [],
  },
  randomWeapons: {
    table: [{ min: 1, max: 100, group: 'sword' }],
    size: [{ min: 1, max: 100, size: 'tiny' }],
    groups: { sword: [{ min: 1, max: 100, itemTypeId: 'blade' }] },
  },
  creatureTypes: [],
  randomArmor: [],
  randomSpells: { realm: [], lists: { essence: [{ min: 1, max: 100, listCode: null }] } },
  gems: {
    precious: { columns: [{ min: 10, max: 99, rows: [{ min: 1, max: 100, itemTypeId: 'ruby' }] }] },
    semiPrecious: { columns: [] },
  },
} as unknown as TreasureTablesDto;

const tabs = buildTreasureTabs(dto, t, (id) => `name of ${id}`);

describe('treasure table model (workspace spec 094)', () => {
  it('shows the open ranges as text', () => {
    expect(rangeLabel(-999, 0, t)).toBe('0 or less');
    expect(rangeLabel(201, 999, t)).toBe('201+');
    expect(rangeLabel(7, 7, t)).toBe('7');
    expect(rangeLabel(1, 5, t)).toBe('1-5');
  });

  it('finds the row of a total, at the limits and in the open ranges', () => {
    const table = findTreasureTable(tabs, '7-1c')!.group.tables[0];
    expect(rowAt(table, -40)?.key).toBe('-999');
    expect(rowAt(table, 0)?.key).toBe('-999');
    expect(rowAt(table, 1)?.key).toBe('1');
    expect(rowAt(table, 5000)).toBeUndefined();
    expect(rowAt(table, null)).toBeUndefined();
  });

  it('finds the table of every die that reads one', () => {
    expect(findTreasureTable(tabs, 'magic-melee')).toMatchObject({ tab: { id: 'magic' }, tableIndex: 0 });
    expect(findTreasureTable(tabs, '7-1j-sword')).toMatchObject({ tab: { id: 'random' } });
    expect(findTreasureTable(tabs, '7-1r-essence')).toMatchObject({ group: { id: 'spell-lists' } });
    expect(findTreasureTable(tabs, '2-4d')).toMatchObject({ group: { id: '2-4d' }, tableIndex: null });
    expect(findTreasureTable(tabs, 'magic-price')).toBeNull();
  });

  it('names the items and sorts the codes', () => {
    expect(findTreasureTable(tabs, '7-1d')!.group.tables[0].rows[0].cells[1]).toBe('name of ring');
    expect(findTreasureTable(tabs, '7-1a')!.group.tables[0].rows.map((row) => row.cells[0])).toEqual(['a', 'b']);
  });

  it('keeps the magic tables to their highest total and with a modifier', () => {
    expect(findTreasureTable(tabs, 'magic-melee')!.group).toMatchObject({ maxTotal: 300, modifier: true });
  });
});
