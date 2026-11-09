import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { D100, NumberPadField, Panel, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TreasureTableFocus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { rowAt, TreasureTableGroup } from './treasure-table-model';

/** A focus of the roll panel; `nonce` makes the same die shown twice count. */
export type TableFocusRequest = TreasureTableFocus & { nonce: number; tableIndex: number | null };

const TABLE_MAX_HEIGHT = 420;

/** A block of tables with its own roll: the total marks its row. Nothing leaves the browser. */
const TreasureTableGroupView: FC<{ group: TreasureTableGroup; focus: TableFocusRequest | null }> = ({
  group,
  focus,
}) => {
  const { t } = useTranslation();
  const [tableIndex, setTableIndex] = useState(0);
  const [roll, setRoll] = useState<number | null>(null);
  const [modifier, setModifier] = useState<number | null>(0);
  const section = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const marked = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!focus) return;
    if (focus.tableIndex !== null) setTableIndex(focus.tableIndex);
    setRoll(focus.roll);
    setModifier(focus.modifier);
    section.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focus]);

  const table = group.tables[tableIndex] ?? group.tables[0];
  const rollable = !!table?.rows.some((row) => row.min !== undefined);
  const raw = roll === null ? null : roll + (group.modifier ? (modifier ?? 0) : 0);
  const total = raw === null || group.maxTotal === undefined ? raw : Math.min(raw, group.maxTotal);
  const row = table ? rowAt(table, total) : undefined;

  // Inside the table only: the page stays where it is
  useEffect(() => {
    if (container.current && marked.current) {
      container.current.scrollTop = marked.current.offsetTop - container.current.clientHeight / 2;
    }
  }, [row?.key, table?.id]);

  if (!table) return null;

  return (
    <div ref={section} style={{ scrollMarginTop: 96 }}>
      <Panel
        variant="outlined"
        dense
        title={group.title}
        extra={
          rollable ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              {group.modifier && (
                <Box sx={{ width: 110 }}>
                  <NumberPadField
                    label={t('modifier')}
                    size="small"
                    value={modifier}
                    onChange={setModifier}
                    integer
                    signed
                  />
                </Box>
              )}
              <RollField spec={D100} value={roll} onChange={(value) => setRoll(value.total)} onClear={() => setRoll(null)} compact />
            </Stack>
          ) : undefined
        }
      >
        <Stack spacing={1}>
          {group.tables.length > 1 && (
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {group.tables.map((each, index) => (
                <Chip
                  key={each.id}
                  label={each.label}
                  color={index === tableIndex ? 'primary' : 'default'}
                  onClick={() => setTableIndex(index)}
                />
              ))}
            </Stack>
          )}
          <TableContainer ref={container} sx={{ maxHeight: TABLE_MAX_HEIGHT }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {table.columns.map((column) => (
                    <TableCell key={column.key}>{column.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {table.rows.map((each) => {
                  const selected = each.key === row?.key;
                  return (
                    <TableRow
                      key={each.key}
                      ref={selected ? marked : undefined}
                      selected={selected}
                      sx={
                        selected
                          ? { bgcolor: (theme) => `${alpha(theme.palette.primary.main, 0.2)} !important` }
                          : undefined
                      }
                    >
                      {each.cells.map((cell, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            fontVariantNumeric: 'tabular-nums',
                            ...(selected && { fontWeight: 600 }),
                          }}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Panel>
    </div>
  );
};

export default TreasureTableGroupView;
