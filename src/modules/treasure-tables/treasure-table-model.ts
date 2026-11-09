import type { TFunction } from 'i18next';
import type { TreasureQuality, TreasureTablesDto } from '@labcabrera-rmu/rmu-react-shared-lib';
import { TREASURE_MAGIC_TABLES, TREASURE_QUALITIES } from '@labcabrera-rmu/rmu-react-shared-lib';

type Translate = TFunction;

export type TreasureTableRow = { key: string; min?: number; max?: number; cells: string[] };
export type TreasureColumn = { key: string; header: string };

/** One table. Its id is the `table` of the dice of the API when a die reads it. */
export type TreasureTable = { id: string; label?: string; columns: TreasureColumn[]; rows: TreasureTableRow[] };

/** A block of the page: one table, or several chosen with chips. */
export type TreasureTableGroup = {
  id: string;
  title: string;
  tables: TreasureTable[];
  /** The roll has a modifier (7-1c and the magic item tables). */
  modifier?: boolean;
  /** Highest total of the roll: higher ones read the last row. */
  maxTotal?: number;
};

export type TreasureTab = { id: string; label: string; groups: TreasureTableGroup[] };

/** The magic item tables never read past this total, as in the generator of the API. */
const MAX_MAGIC_TOTAL = 300;
const OPEN_LOW = -999;
const OPEN_HIGH = 999;

/** `0 or less` and `201+` for the open ranges of the API. */
export const rangeLabel = (min: number, max: number, t: Translate): string => {
  if (min <= OPEN_LOW) return t('loot-range-or-less', { max });
  if (max >= OPEN_HIGH) return `${min}+`;
  return min === max ? String(min) : `${min}-${max}`;
};

/** The row of a total, or none. */
export const rowAt = (table: TreasureTable, total: number | null): TreasureTableRow | undefined =>
  total === null
    ? undefined
    : table.rows.find((row) => row.min !== undefined && row.max !== undefined && total >= row.min && total <= row.max);

/** Own keys of the tables, shown readable when they have no translation. */
const readable = (key: string) => {
  const words = key.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

/** Every table of the page, from the document of the API; nothing of the book lives in the code. */
export const buildTreasureTabs = (
  dto: TreasureTablesDto,
  t: Translate,
  itemName: (itemTypeId: string) => string
): TreasureTab[] => {
  const title = (id: string) => t(`treasure-table-${id}`, { defaultValue: id });
  const column = (key: string, header = t(`loot-column-${key}`)): TreasureColumn => ({ key, header });
  const range = column('range', t('roll'));
  const item = (id: string | null | undefined) => (id ? itemName(id) : t('loot-column-none'));
  const qualityColumns = TREASURE_QUALITIES.map((quality) => column(quality, t(`treasure-quality-${quality}`)));

  /** A table whose rows are ranges of a roll. */
  const ranged = <R extends { min: number; max: number }>(
    id: string,
    columns: TreasureColumn[],
    rows: R[] | undefined,
    cells: (row: R) => string[]
  ): TreasureTable => ({
    id,
    columns: [range, ...columns],
    rows: (rows ?? []).map((row) => ({
      key: `${row.min}`,
      min: row.min,
      max: row.max,
      cells: [rangeLabel(row.min, row.max, t), ...cells(row)],
    })),
  });

  const single = (table: TreasureTable, extra: Partial<TreasureTableGroup> = {}): TreasureTableGroup => ({
    id: table.id,
    title: title(table.id),
    tables: [table],
    ...extra,
  });

  const qualityRecord = (id: string, value: (quality: TreasureQuality) => string): TreasureTable => ({
    id,
    columns: qualityColumns,
    rows: [{ key: id, cells: TREASURE_QUALITIES.map(value) }],
  });

  const codeRows = (['wealth', 'lifestyle', 'magic'] as const).flatMap((kind) =>
    Object.entries(dto.codes?.[kind] ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, quality]) => ({
        key: `${kind}-${code}`,
        cells: [code, t(`treasure-${kind}`), t(`treasure-quality-${quality}`)],
      }))
  );

  const gems = (id: string, columns: TreasureTablesDto['gems']['precious']['columns'] | undefined) => ({
    id,
    title: title(id),
    tables: (columns ?? []).map((gemColumn, index) => ({
      ...ranged(`${id}-${index}`, [column('item')], gemColumn.rows, (row) => [item(row.itemTypeId)]),
      label: `${rangeLabel(gemColumn.min, gemColumn.max, t)} ${t('loot-silver')}`,
    })),
  });

  const weapons = dto.randomWeapons;
  const spells = dto.randomSpells;

  return [
    {
      id: 'codes',
      label: t('loot-tables-tab-codes'),
      groups: [
        single({
          id: '7-1a',
          columns: [column('code'), column('kind'), column('quality')],
          rows: codeRows,
        }),
      ],
    },
    {
      id: 'wealth',
      label: t('loot-tables-tab-wealth'),
      groups: [
        single(ranged('7-1b', [column('rolls')], dto.wealthRolls, (row) => [String(row.rolls)])),
        single(
          ranged('7-1c', [column('value')], dto.wealthValue, (row) => [`${row.valueMin}-${row.valueMax}`]),
          { modifier: true }
        ),
        single({
          id: 'wealth-modifiers',
          columns: [column('modifier', t('loot-column-reason')), column('value')],
          rows: (dto.wealthValueModifiers ?? []).map((row) => ({
            key: row.key,
            cells: [t(`loot-modifier-${row.key}`, { defaultValue: readable(row.key) }), signed(row.value)],
          })),
        }),
        single(
          ranged('7-1c-type', [column('type'), column('multiplier')], dto.wealthType, (row) => [
            t(`loot-wealth-type-${row.type}`),
            `x${row.multiplier}`,
          ])
        ),
        single(
          qualityRecord('wealth-multipliers', (quality) => `x${dto.wealthMultipliers?.[quality] ?? '-'}`)
        ),
        single(ranged('7-1d', [column('item')], dto.jewelryTypes, (row) => [item(row.itemTypeId)])),
        single(ranged('7-1e', [column('type')], dto.artTypes, (row) => [readable(row.key)])),
        gems('2-4d', dto.gems?.precious?.columns),
        gems('2-4e', dto.gems?.semiPrecious?.columns),
      ],
    },
    {
      id: 'gear',
      label: t('loot-tables-tab-gear'),
      groups: [
        single(
          ranged('7-1f', qualityColumns, dto.gearQuality, (row) =>
            TREASURE_QUALITIES.map(
              (quality) =>
                `${signed(row[quality].total)} / ${row[quality].max === null ? '-' : signed(row[quality].max as number)}`
            )
          )
        ),
      ],
    },
    {
      id: 'magic',
      label: t('loot-tables-tab-magic'),
      groups: [
        single(
          ranged('7-1g', qualityColumns, dto.magicTreasure, (row) =>
            TREASURE_QUALITIES.map((quality) => row[quality].map(signed).join(', ') || '-')
          )
        ),
        single(qualityRecord('magic-max-level', (quality) => String(dto.magicMaxLevel?.[quality] ?? '-'))),
        single(
          ranged('7-1h', [column('table')], dto.itemType, (row) => [title(`magic-${row.table}`)])
        ),
        {
          id: 'magic-tables',
          title: title('magic-tables'),
          modifier: true,
          maxTotal: MAX_MAGIC_TOTAL,
          tables: TREASURE_MAGIC_TABLES.map((table) => ({
            ...ranged(`magic-${table}`, [column('result'), column('price')], dto.magicTables?.[table], (row) => [
              row.label,
              `${row.price.min}-${row.price.max}`,
            ]),
            label: title(`magic-${table}`),
          })),
        },
      ],
    },
    {
      id: 'random',
      label: t('loot-tables-tab-random'),
      groups: [
        single(
          ranged('7-1j', [column('group')], weapons?.table, (row) => [title(`7-1j-${row.group}`)])
        ),
        {
          id: 'weapon-groups',
          title: title('weapon-groups'),
          tables: Object.entries(weapons?.groups ?? {}).map(([group, rows]) => ({
            ...ranged(`7-1j-${group}`, [column('item')], rows, (row) => [item(row.itemTypeId)]),
            label: title(`7-1j-${group}`),
          })),
        },
        single(
          ranged('7-1j-size', [column('size')], weapons?.size, (row) => [
            t(row.size, { defaultValue: readable(row.size) }),
          ])
        ),
        single(
          ranged('7-1k', [column('type')], dto.creatureTypes, (row) => [
            t(`treasure-creature-${row.key}`, { defaultValue: readable(row.key) }),
          ])
        ),
        single(ranged('7-1n', [column('item')], dto.randomArmor, (row) => [item(row.itemTypeId)])),
        single(
          ranged('7-1r', [column('realm')], spells?.realm, (row) => [
            t(row.realm, { defaultValue: readable(row.realm) }),
          ])
        ),
        {
          id: 'spell-lists',
          title: title('spell-lists'),
          tables: Object.entries(spells?.lists ?? {}).map(([realm, rows]) => ({
            ...ranged(`7-1r-${realm}`, [column('list')], rows, (row) => [row.listCode ?? t('treasure-other-list')]),
            label: title(`7-1r-${realm}`),
          })),
        },
      ],
    },
  ];
};

/** Where the table of a die is shown; a die that reads no table (a price, a pick) has no place. */
export const findTreasureTable = (
  tabs: TreasureTab[],
  table: string
): { tab: TreasureTab; group: TreasureTableGroup; tableIndex: number | null } | null => {
  for (const tab of tabs) {
    for (const group of tab.groups) {
      const tableIndex = group.tables.findIndex((each) => each.id === table);
      if (tableIndex >= 0) return { tab, group, tableIndex };
      // The gems: the die names the group, and which column it read depends on the value of the gem
      if (group.id === table) return { tab, group, tableIndex: null };
    }
  }
  return null;
};
