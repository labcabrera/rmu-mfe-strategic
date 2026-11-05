/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Autocomplete, Box, Chip, Grid, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  fetchEnumerations,
  LanguageRanks,
  LoadingState,
  MULTILINGUAL_RANKS,
  NumericInput,
  SectionLabel,
  useSpecializationLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

const LANGUAGE_CATEGORY = 'language';

/** One language of the distribution: the player splits its ranks between spoken and written (spec 076, P1). */
export interface MultilingualRow {
  language: string;
  spoken: number;
  written: number;
}

export const emptyMultilingualRows = (count: number): MultilingualRow[] =>
  Array.from({ length: count }, () => ({ language: '', spoken: 0, written: 0 }));

/** Ranks each language takes: all of them in one language, half in each of two. */
const target = (rows: MultilingualRow[]) => MULTILINGUAL_RANKS / Math.max(rows.length, 1);

/** The distribution is complete: every language chosen, different, and with its share of the ranks. */
export const isMultilingualValid = (rows: MultilingualRow[]): boolean =>
  rows.length > 0 &&
  rows.every((row) => !!row.language && row.spoken + row.written === target(rows)) &&
  new Set(rows.map((row) => row.language)).size === rows.length;

/** The `languageRanks` of the request: an entry for each spoken or written skill that receives ranks. */
export const toLanguageRanks = (rows: MultilingualRow[]): LanguageRanks[] =>
  rows.flatMap((row) =>
    [
      { skillId: 'language-spoken' as const, specialization: row.language, ranks: row.spoken },
      { skillId: 'language-written' as const, specialization: row.language, ranks: row.written },
    ].filter((entry) => entry.ranks > 0)
  );

/**
 * How the ranks of Multilingual are distributed (workspace spec 076, A7): one language with all of them or two with
 * half each, and in each language the spoken and written ranks the player chooses, with a counter of the ranks
 * assigned. The languages are the keys of the `language` enumeration of the realm of the game.
 */
const MultilingualRanksPicker: FC<{
  realmId?: string;
  rows: MultilingualRow[];
  onChange: (rows: MultilingualRow[]) => void;
}> = ({ realmId, rows, onChange }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const specializationLabel = useSpecializationLabel();
  const [languages, setLanguages] = useState<string[]>();

  useEffect(() => {
    const realmQuery = realmId ? `;(realmId==${realmId},realmId==null)` : '';
    fetchEnumerations(`category==${LANGUAGE_CATEGORY}${realmQuery}`, 0, 200, auth)
      .then((page) => setLanguages(page.content.map((e) => e.key)))
      .catch(notify.error);
  }, [realmId]);

  const share = target(rows);
  const assigned = rows.reduce((sum, row) => sum + row.spoken + row.written, 0);
  const update = (index: number, changes: Partial<MultilingualRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  const changeCount = (count: number) =>
    onChange(emptyMultilingualRows(count).map((empty, index) => ({ ...empty, language: rows[index]?.language ?? '' })));
  const repeated = rows.length > 1 && !!rows[0].language && rows[0].language === rows[1].language;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <SectionLabel>{t('multilingual-languages')}</SectionLabel>
        <Chip
          size="small"
          color={assigned === MULTILINGUAL_RANKS ? 'success' : 'default'}
          label={t('multilingual-ranks-assigned', { assigned, total: MULTILINGUAL_RANKS })}
        />
      </Stack>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={rows.length}
        onChange={(_, value: number | null) => value && changeCount(value)}
        aria-label={t('multilingual-languages')}
      >
        <ToggleButton value={1}>{t('multilingual-one-language', { ranks: MULTILINGUAL_RANKS })}</ToggleButton>
        <ToggleButton value={2}>{t('multilingual-two-languages', { ranks: MULTILINGUAL_RANKS / 2 })}</ToggleButton>
      </ToggleButtonGroup>
      {!languages ? (
        <LoadingState />
      ) : (
        rows.map((row, index) => {
          const total = row.spoken + row.written;
          return (
            <Box key={index}>
              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={languages}
                    getOptionLabel={(option) => specializationLabel(option)}
                    value={row.language || null}
                    onChange={(_, value) => update(index, { language: value || '' })}
                    renderInput={(params) => <TextField {...params} label={t('language')} required />}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <NumericInput
                    label={t('language-spoken')}
                    value={row.spoken}
                    onChange={(value) => update(index, { spoken: Math.max(0, Math.min(share, value || 0)) })}
                    integer
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <NumericInput
                    label={t('language-written')}
                    value={row.written}
                    onChange={(value) => update(index, { written: Math.max(0, Math.min(share, value || 0)) })}
                    integer
                  />
                </Grid>
              </Grid>
              {total !== share && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t('multilingual-language-ranks', { assigned: total, total: share })}
                </Alert>
              )}
            </Box>
          );
        })
      )}
      {repeated && <Alert severity="warning">{t('multilingual-repeated-language')}</Alert>}
    </Stack>
  );
};

export default MultilingualRanksPicker;
