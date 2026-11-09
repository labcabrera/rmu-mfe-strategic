/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, List, ListItem, ListItemText, Stack } from '@mui/material';
import {
  Character,
  EmptyState,
  fetchCharacterHealingLog,
  formatBonus,
  HealingLogEntry,
  HealingType,
  HpBreakdown,
  HpBySource,
  LoadingState,
  RmuPagination,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
          // Workspace spec 068: units spent in the game, ones no longer carried and the lasting modifiers
          count(s, 'itemsConsumed') ? t('healing-log-items-consumed', { count: count(s, 'itemsConsumed') }) : undefined,
          count(s, 'itemsConsumedIgnored')
            ? t('healing-log-items-consumed-ignored', { count: count(s, 'itemsConsumedIgnored') })
            : undefined,
          count(s, 'temporaryModifiersAdded')
            ? t('healing-log-temporary-modifiers-added', { count: count(s, 'temporaryModifiersAdded') })
            : undefined,
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
          }) +
          (s.fullRest ? ` · ${t('full-rest')}` : '') +
          (s.active ? ` · ${t('rest-active')}` : '')
        );
      // Workspace spec 079, C1 and C2
      case 'amputation':
        return [
          t('healing-log-amputation', {
            method: t(`amputation-method-${str(s, 'method') ?? 'surgical'}`),
            limb: t('lost-limb-label', {
              location: t(str(s, 'location') ?? 'arm'),
              side: t(`side-${str(s, 'side') ?? 'left'}`),
            }),
            total: num(s, 'total') ?? '-',
            result: t(str(s, 'result') ?? ''),
          }),
          s.critical ? t('amputation-critical-short') : undefined,
          s.systemShock ? t('amputation-system-shock-short') : undefined,
        ]
          .filter(Boolean)
          .join(' · ');
      case 'strenuous-failure':
        return t(s.absolute ? 'healing-log-strenuous-failure-absolute' : 'healing-log-strenuous-failure', {
          before: num(s, 'penaltyBefore') ?? 0,
          after: num(s, 'penalty') ?? 0,
        });
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
        if (action === 'temporary-modifiers-expired') {
          return t('healing-log-temporary-modifiers-expired', { count: count(s, 'modifiers') });
        }
        if (action === 'temporary-modifier-removed') {
          return t('healing-log-temporary-modifier-removed', {
            kind: t(`temporary-modifier-kind-${str(s, 'kind') ?? 'morale'}`),
            value: formatBonus(num(s, 'value') ?? 0),
          });
        }
        return t('healing-log-manual');
      }
    }
  };
};

/** Paginated healing log of the character (healed injuries included), newest first as the API returns it. */
const HealingLogList: FC<{ character: Character }> = ({ character }) => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const text = useEntryText();
  const [page, setPage] = useState(0);
  const query = useQuery({
    queryKey: ['healing-log', character.id, page],
    queryFn: () => fetchCharacterHealingLog(character.id, page, PAGE_SIZE, auth),
    gcTime: 0,
    placeholderData: keepPreviousData,
  });
  const entries = query.isError ? [] : query.data?.content;
  const totalPages = query.data?.pagination?.totalPages ?? 0;
  const { refetch } = query;

  // Reloads when the character changes (a new treatment, rest...); by identity, as each update brings new arrays.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    refetch();
  }, [character.hp.current, character.injuries, character.conditions]);

  useEffect(() => {
    if (query.error) notify.error(query.error);
  }, [query.error]);

  if (!entries) return <LoadingState />;
  if (entries.length === 0) return <EmptyState dense title={t('healing-log-empty')} />;

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
                entry.gameDay !== undefined ? t('campaign-day', { day: entry.gameDay }) : undefined,
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
        <RmuPagination dense page={page} pageSize={PAGE_SIZE} totalPages={totalPages} setPage={setPage} />
      )}
    </Stack>
  );
};

export default HealingLogList;
