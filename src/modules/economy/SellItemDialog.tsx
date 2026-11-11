import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import {
  ItemConditionChip,
  itemUnits,
  ModifierSelectionValues,
  NumericInput,
  PriceBreakdownView,
  RmuDialog,
  sellItem,
  StrategicItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useBusyAction } from '../shared/useBusyAction';
import {
  emptyTrading,
  MarketConditions,
  marketFactors,
  negotiatorOf,
  TradingFields,
  tradingRequest,
  TradingValue,
  usePriceQuote,
  useTradingModifiers,
  useTradingTables,
} from './TradingFields';
import { AmountField, DialogProps, partialAmount } from './item-operation-common';

/** Default commission of a jeweler when the economy rules do not give one (spec 062). */
const DEFAULT_JEWELER_PERCENT = 3;

/** Gems and jewelry can go to a jeweler (spec 062). */
const isJewelerItem = (item: StrategicItem) => item.category === 'gem' || item.category === 'jewelry';

/**
 * Sells an item at the market (spec 023, decision 12): its value by its condition and the sale percent, with the market
 * conditions and the Trading roll of spec 048. A gem or a jewel may go to a jeweler instead (spec 062), for its value
 * less the commission and without haggling.
 */
export const SellItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | null>(itemUnits(item));
  const [salePercent, setSalePercent] = useState<number | null>(null);
  const { tables } = useTradingTables();
  const modifiers = useTradingModifiers();
  const [conditions, setConditions] = useState<ModifierSelectionValues>({});
  const [tradingValue, setTradingValue] = useState<TradingValue>(() => emptyTrading(view.character));
  const { busy, run } = useBusyAction();
  const canJeweler = isJewelerItem(item);
  const [jeweler, setJeweler] = useState(canJeweler);
  const [jewelerPercent, setJewelerPercent] = useState<number | null>(null);
  const trading = tradingRequest(
    tradingValue,
    negotiatorOf(tradingValue, view.character, view.members),
    modifiers,
    'sale'
  );
  const factors = marketFactors(tables, 'sale', conditions);
  const dto = jeweler
    ? {
        amount: partialAmount(item, amount),
        jeweler: true,
        ...(jewelerPercent !== null ? { jewelerPercent } : {}),
      }
    : {
        amount: partialAmount(item, amount),
        ...(salePercent !== null ? { salePercent } : {}),
        ...(factors.length ? { factors } : {}),
        ...(trading ? { trading } : {}),
      };

  const { quote, error } = usePriceQuote(
    amount && amount > 0 ? { kind: 'sale', itemId: item.id, holder: view.holder, ...dto } : undefined
  );
  const noDeal = quote?.price.trading?.pricePercent === null;

  const onSell = () => {
    run(sellItem(item.id, dto, auth), onDone);
  };

  return (
    <RmuDialog
      open
      title={t('sell-item', { name: item.name })}
      onCancel={onClose}
      buttons={
        <Button variant="contained" disabled={!quote || busy || noDeal} onClick={onSell}>
          {t('sell')}
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('condition')}
          </Typography>
          <ItemConditionChip condition={item.condition} />
        </Stack>
        <AmountField item={item} value={amount} onChange={setAmount} />
        {canJeweler && (
          <FormControlLabel
            control={<Switch checked={jeweler} onChange={(_, checked) => setJeweler(checked)} />}
            label={t('sell-to-jeweler')}
          />
        )}
        {jeweler ? (
          <>
            <NumericInput
              label={t('jeweler-percent')}
              placeholder={`${quote?.rules.jewelerPercent ?? DEFAULT_JEWELER_PERCENT}`}
              value={jewelerPercent}
              onChange={setJewelerPercent}
              min={0}
              max={100}
              maxFractionDigits={1}
            />
            <Typography variant="caption" color="text.secondary">
              {t('sell-to-jeweler-hint')}
            </Typography>
          </>
        ) : (
          <>
            <NumericInput
              label={t('price-sale-percent-override')}
              placeholder={quote ? `${quote.rules.salePercent}` : undefined}
              value={salePercent}
              onChange={setSalePercent}
              min={0}
              max={200}
              integer
            />
            <MarketConditions context="sale" value={conditions} onChange={setConditions} />
            <TradingFields
              character={view.character}
              members={view.members}
              factionId={view.faction?.id}
              context="sale"
              modifiers={modifiers}
              value={tradingValue}
              onChange={setTradingValue}
            />
          </>
        )}
        {quote && <PriceBreakdownView price={quote.price} funds={{ label: t('price-funds-after'), gold: view.gold }} />}
        {noDeal && (
          <Alert severity="error">{t(`trading-outcome-${quote?.price.trading?.outcome ?? 'no-agreement'}`)}</Alert>
        )}
        {!!error && <Alert severity="warning">{t('price-quote-unavailable')}</Alert>}
      </Stack>
    </RmuDialog>
  );
};
