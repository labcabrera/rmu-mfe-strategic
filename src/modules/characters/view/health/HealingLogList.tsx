/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, List, ListItem, ListItemText, Pagination, Stack, Typography } from '@mui/material';
import {
  Character,
  fetchCharacterHealingLog,
  HealingLogEntry,
  HealingType,
  HpBySource,
  HpBreakdown,
  LoadingState,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import { healingTypeKey } from './health-rules';

const PAGE_SIZE = 10;

type Summary = Record<string, unknown>;
const num = (summary: Summary, key: string): number | undefined =>
  typeof summary[key] === 'number' ? (summary[key] as number) : undefined;
const str = (summary: Summary, key: string): string | undefined =>
  typeof summary[key] === 'string' ? (summary[key] as string) : undefined;
const count = (summary: Summary, key: string): number =>
  Array.isArray(summary[key]) ? (summary[key] as unknown[]).length : 0;

/** Hit point totals of a tactical game (spec 013, §1.1), when the summary has a well formed one. */
const hpBySourceOf = (entry: HealingLogEntry): HpBySource | undefined => {
  if (entry.kind !== 'tactical-outcome') return undefined;
  const value = (entry.summary || {}).hpBySource as HpBySource | undefined;
  if (!value || typeof value !== 'object') return undefined;
  return {
    byKind: value.byKind && typeof value.byKind === 'object' ? value.byKind : {},
    byAttacker: Array.isArray(value.byAttacker) ? value.byAttacker : [],
  };
};

/** Text of one healing log entry, by kind, from the data of its summary. */
const useEntryText = () => {
  const { t } = useTranslation();
  return (entry: HealingLogEntry): string => {
    const s = entry.summary || {};
    switch (entry.kind) {
      case 'tactical-outcome': {
        const fate = str(s, 'fate');
        return [
          t('healing-log-tactical-outcome', {
            game: str(s, 'tacticalGameName') ?? entry.tacticalGameId ?? '',
            before: num(s, 'hpBefore') ?? '-',
            after: num(s, 'hpAfter') ?? '-',
            added: count(s, 'injuriesAdded'),
            healed: count(s, 'injuriesHealed'),
          }),
          fate ? t(`fate-${fate}`) : undefined,
        ]
          .filter(Boolean)
          .join(' · ');
      }
      case 'treatment': {
        const healingType = str(s, 'healingType');
        return t('healing-log-treatment', {
          healer: entry.healerName ?? '',
          procedure: t(`procedure-${str(s, 'procedure') ?? 'dress'}`),
          total: num(s, 'total') ?? '-',
          result: t(str(s, 'result') ?? ''),
          healingType: healingType ? t(healingTypeKey(healingType as HealingType)) : '',
        });
      }
      case 'recovery-roll':
        return t('healing-log-recovery-roll', {
          total: num(s, 'total') ?? '-',
          count: num(s, 'totalDays') ?? 0,
        });
      case 'permanent-roll':
        return t('healing-log-permanent-roll', {
          total: num(s, 'total') ?? '-',
          result: t(str(s, 'result') ?? ''),
          penalty: num(s, 'penalty') ?? 0,
        });
      case 'rest':
        return (
          t('healing-log-rest', {
            hours: num(s, 'hours') ?? 0,
            days: num(s, 'restDays') ?? 0,
            before: num(s, 'hpBefore') ?? '-',
            after: num(s, 'hpAfter') ?? '-',
            counter: num(s, 'days') ?? 0,
          }) + (s.fullRest ? ` · ${t('full-rest')}` : '')
        );
      default: {
        const action = str(s, 'action');
        if (action === 'condition-resolved') {
          return t('healing-log-condition-resolved', {
            condition: t(`condition-${str(s, 'status') ?? 'unconscious'}`),
          });
        }
        if (action === 'injury-added') {
          return t('healing-log-injury-added', {
            type: t(`injury-type-${str(s, 'type') ?? 'unknown'}`),
            penalty: num(s, 'penalty') ?? 0,
          });
        }
        if (action === 'injury-updated') return t('healing-log-injury-updated');
        return t('healing-log-manual');
      }
    }
  };
};

/** Paginated healing log of the character (healed injuries included), newest first as the API returns it. */
const HealingLogList: FC<{ character: Character }> = ({ character }) => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const text = useEntryText();
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState<HealingLogEntry[]>();
  const [totalPages, setTotalPages] = useState(0);

  // Reloads when the page changes and when the character changes (a new treatment, rest...).
  useEffect(() => {
    fetchCharacterHealingLog(character.id, page, PAGE_SIZE, auth)
      .then((result) => {
        setEntries(result.content);
        setTotalPages(result.pagination?.totalPages ?? 0);
      })
      .catch((error) => {
        setEntries([]);
        notify.error(error);
      });
  }, [character.id, page, character.hp.current, character.injuries, character.conditions]);

  if (!entries) return <LoadingState />;
  if (entries.length === 0) return <Typography color="text.secondary">{t('healing-log-empty')}</Typography>;

  const injuryLabel = (injuryId?: string) => {
    const injury = injuryId ? (character.injuries || []).find((item) => item.id === injuryId) : undefined;
    return injury ? t(`injury-type-${injury.type}`) : undefined;
  };

  return (
    <Stack spacing={1}>
      <List dense disablePadding>
        {entries.map((entry) => (
          <ListItem key={entry.id} disableGutters divider sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <ListItemText
              primary={text(entry)}
              secondary={[
                new Date(entry.at).toLocaleString(i18n.language),
                t(`healing-log-kind-${entry.kind}`),
                injuryLabel(entry.injuryId),
              ]
                .filter(Boolean)
                .join(' · ')}
            />
            {hpBySourceOf(entry) && (
              <Box sx={{ pb: 1, maxWidth: 360 }}>
                <HpBreakdown bySource={hpBySourceOf(entry)} dense />
              </Box>
            )}
          </ListItem>
        ))}
      </List>
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(_, value) => setPage(value - 1)}
          size="small"
          sx={{ alignSelf: 'center' }}
        />
      )}
    </Stack>
  );
};

export default HealingLogList;
