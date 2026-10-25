import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import {
  ItemConditionChip,
  ItemLedgerEntry,
  ItemModifierChips,
  ItemThumb,
  MoneyDisplay,
  StrategicItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Outcomes that leave the item worse or lose the materials. */
const BAD_OUTCOMES = ['wasted', 'broken', 'unrepairable', 'cannot-fix-broken', 'jury-rigged-useless'];

/** What a craft or a repair gave: the maneuver, the outcome, the gold paid and the item as it is now. */
const ItemLedgerOutcome: FC<{ entry: ItemLedgerEntry; item: StrategicItem | null }> = ({ entry, item }) => {
  const { t } = useTranslation();
  const bad = !!entry.outcome && BAD_OUTCOMES.includes(entry.outcome);
  const paid = entry.payments.reduce((sum, payment) => sum + payment.gold, 0);
  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      {entry.outcome && <Alert severity={bad ? 'error' : 'success'}>{t(`ledger-outcome-${entry.outcome}`)}</Alert>}
      {entry.maneuver && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          <Typography variant="body2" color="text.secondary">
            {t('maneuver')}
          </Typography>
          <Chip size="small" label={`${t('total')}: ${entry.maneuver.total}`} />
          {entry.maneuver.result && <Chip size="small" label={t(entry.maneuver.result)} />}
          {entry.maneuver.unusualEvent && <Chip size="small" color="warning" label={t('unusual-event')} />}
        </Stack>
      )}
      {entry.note && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {entry.note}
        </Typography>
      )}
      {paid !== 0 && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('ledger-gold')}
          </Typography>
          <MoneyDisplay gold={paid} signed />
        </Stack>
      )}
      {item && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ItemThumb item={item} size={56} disabled={!!item.condition?.broken} />
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
              <ItemConditionChip condition={item.condition} />
            </Stack>
            <ItemModifierChips modifiers={item.modifiers ?? []} />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default ItemLedgerOutcome;
