/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import {
  EmptyState,
  fetchItemLedger,
  ItemHolder,
  LoadingState,
  MoneyDisplay,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 20;

const KIND_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  purchase: 'primary',
  sale: 'success',
  transfer: 'info',
  craft: 'secondary',
  repair: 'warning',
  discard: 'error',
  'gold-transfer': 'default',
  // Spec 062: the doses of a herb search
  found: 'success',
};

/**
 * The item ledger of a holder or an item (spec 023, decision 6), newest first. `perspective` is the holder whose gold
 * is shown; `names` turns holder ids into names.
 */
const ItemLedgerList: FC<{
  rsql: string;
  perspective?: ItemHolder;
  names?: Record<string, string>;
  /** Changes when an operation is done, to load the list again. */
  refreshKey?: unknown;
}> = ({ rsql, perspective, names = {}, refreshKey }) => {
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const notify = useApiNotify();
  // `refreshKey` may be any object, so it counts by identity: a change starts the list again from its first page.
  const [generation, setGeneration] = useState({ refreshKey, count: 0 });
  if (generation.refreshKey !== refreshKey) setGeneration({ refreshKey, count: generation.count + 1 });

  const query = useInfiniteQuery({
    queryKey: ['item-ledger', rsql, generation.count],
    queryFn: ({ pageParam }) => fetchItemLedger(rsql, pageParam, PAGE_SIZE, auth),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.content.length < PAGE_SIZE ? undefined : lastPageParam + 1,
    gcTime: 0,
    placeholderData: keepPreviousData,
  });
  const entries = query.data?.pages.flatMap((page) => page.content);

  useEffect(() => {
    if (query.error) notify.error(query.error);
  }, [query.error]);

  if (!entries) return <LoadingState />;
  if (entries.length === 0) return <EmptyState title={t('ledger-empty')} />;

  const holderName = (holder: ItemHolder | null) =>
    holder ? (names[holder.id] ?? t(holder.kind === 'faction' ? 'armory' : 'character')) : '';
  const dateFormat = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' });

  return (
    <Stack spacing={0.5}>
      {entries.map((entry) => {
        const payments = perspective
          ? entry.payments.filter((p) => p.holder.id === perspective.id)
          : entry.payments.filter((p) => p.gold < 0);
        const gold = payments.reduce((sum, p) => sum + p.gold, 0);
        const route = [entry.from, entry.to].filter(Boolean).map(holderName).join(' → ');
        return (
          <Stack
            key={entry.id}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', px: 1, py: 0.75, borderBottom: 1, borderColor: 'divider' }}
          >
            <Chip
              size="small"
              color={KIND_COLORS[entry.kind] ?? 'default'}
              label={t(`ledger-kind-${entry.kind}`)}
              sx={{ minWidth: 96 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {`${entry.itemName ? t(entry.itemName, { defaultValue: entry.itemName }) : t('gold')}${entry.amount && entry.amount !== 1 ? ` × ${entry.amount}` : ''}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="div">
                {[
                  dateFormat.format(new Date(entry.createdAt)),
                  route,
                  entry.actorId && names[entry.actorId] ? t('ledger-by', { name: names[entry.actorId] }) : '',
                  entry.outcome ? t(`ledger-outcome-${entry.outcome}`) : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Box>
            {gold !== 0 && <MoneyDisplay gold={gold} signed />}
          </Stack>
        );
      })}
      {query.hasNextPage && (
        <Button onClick={() => query.fetchNextPage()} sx={{ alignSelf: 'center' }}>
          {t('load-more')}
        </Button>
      )}
    </Stack>
  );
};

export default ItemLedgerList;
