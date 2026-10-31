/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CardActionArea,
  Divider,
  IconButton,
  Paper,
  Radio,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Item,
  ItemThumb,
  ModifierSelectionValues,
  MoneyDisplay,
  NumericInput,
  PayerMode,
  placePurchaseOrder,
  PriceBreakdownView,
  PurchaseItemOptions,
  PurchaseOrderLine,
  PurchaseOrderQuote,
  QuotePurchaseOrderDto,
  quotePurchaseOrder,
  roundGold,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import {
  emptyTrading,
  MarketConditions,
  marketFactors,
  negotiatorOf,
  TradingFields,
  tradingRequest,
  TradingValue,
  useTradingModifiers,
  useTradingTables,
} from './TradingFields';
import PurchaseOptionsFields, { arePurchaseOptionsValid } from './PurchaseOptionsFields';
import { useStrategicNotify } from '../services/notify-service';
import { HolderView } from './use-holder';

/** A line of the cart; `options` holds the size, carats or jewelry class of spec 062. */
export type CartLine = { item: Item; amount: number; options?: PurchaseItemOptions };

/** The purchase-order line of a cart line, without the empty instance data. */
export const cartLineDto = (line: CartLine): PurchaseOrderLine => ({
  itemTypeId: line.item.id,
  amount: line.amount,
  ...Object.fromEntries(
    Object.entries(line.options ?? {}).filter(([, value]) => value !== null && value !== undefined)
  ),
});

/** Every line of the cart has the instance data it needs (the carats of a gem). */
export const isCartValid = (cart: CartLine[]): boolean =>
  cart.every((line) => arePurchaseOptionsValid(line.item, line.options));

/** Items of a type that does not stack one purchase creates (strategic, spec 041). */
export const MAX_ITEMS_PER_PURCHASE = 100;

const PAYER_MODES: PayerMode[] = ['holder', 'faction', 'split'];

type PurchaseMethod = 'direct' | 'negotiated';

const STEPS = ['checkout-step-cart', 'checkout-step-method', 'checkout-step-payment'];

/** The quote of a purchase order, asked again when the request changes. */
export function usePurchaseOrderQuote(dto: QuotePurchaseOrderDto | undefined) {
  const auth = useAuth();
  const [quote, setQuote] = useState<PurchaseOrderQuote>();
  const [error, setError] = useState<unknown>();
  const key = JSON.stringify(dto ?? null);

  useEffect(() => {
    if (!dto) {
      setQuote(undefined);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      quotePurchaseOrder(dto, auth)
        .then((data) => active && (setQuote(data), setError(undefined)))
        .catch((e) => active && (setQuote(undefined), setError(e)));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);

  return { quote, error };
}

/** The lines of the cart, with their amounts and the price of each one when there is a quote. */
export const CartLines: FC<{
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  quote?: PurchaseOrderQuote;
}> = ({ cart, setCart, quote }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1.5}>
      {cart.map((line) => {
        const price = quote?.lines.find((other) => other.itemTypeId === line.item.id)?.price;
        return (
          <Stack key={line.item.id} spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ItemThumb item={line.item} size={40} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {t(line.item.name, line.item.name)}
                </Typography>
                {price ? (
                  <MoneyDisplay gold={price.total} variant="caption" />
                ) : (
                  <Typography variant="caption">…</Typography>
                )}
                {!line.item.info.stackable && line.amount > 1 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t('cart-separate-units', { count: line.amount })}
                  </Typography>
                )}
              </Box>
              <Box sx={{ width: 72 }}>
                <NumericInput
                  label={t('amount')}
                  value={line.amount}
                  min={1}
                  max={line.item.info.stackable ? undefined : MAX_ITEMS_PER_PURCHASE}
                  integer
                  onChange={(amount) =>
                    setCart((lines) =>
                      lines.map((other) => (other.item.id === line.item.id ? { ...other, amount: amount || 1 } : other))
                    )
                  }
                />
              </Box>
              <IconButton
                size="small"
                aria-label={t('remove')}
                onClick={() => setCart((lines) => lines.filter((other) => other.item.id !== line.item.id))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
            <PurchaseOptionsFields
              item={line.item}
              value={line.options}
              onChange={(options) =>
                setCart((lines) =>
                  lines.map((other) => (other.item.id === line.item.id ? { ...other, options } : other))
                )
              }
            />
          </Stack>
        );
      })}
    </Stack>
  );
};

/** A card to choose among several: a radio, a title, a description and what else it needs. */
const ChoiceCard: FC<{
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}> = ({ selected, disabled, onSelect, icon, title, children }) => (
  <Paper
    variant="outlined"
    sx={{
      flex: 1,
      borderColor: selected ? 'primary.main' : undefined,
      borderWidth: selected ? 2 : 1,
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <CardActionArea disabled={disabled} onClick={onSelect} sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Radio checked={selected} disabled={disabled} tabIndex={-1} sx={{ p: 0 }} />
        {icon}
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
          {children}
        </Stack>
      </Stack>
    </CardActionArea>
  </Paper>
);

/**
 * Checkout of the cart of the market (spec 048, decision 9), like the one of a web shop: the cart, the method (a direct
 * purchase at the expected price, or haggling with the market conditions and a Trading roll, applied once to the whole
 * cart) and the payment, where the payers that do not cover the total are disabled.
 */
const MarketCheckout: FC<{
  view: HolderView;
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  onCancel: () => void;
  onDone: () => void;
}> = ({ view, cart, setCart, onCancel, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const { tables } = useTradingTables();
  const modifiers = useTradingModifiers();
  const isCharacter = view.holder.kind === 'character';
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<PurchaseMethod>('direct');
  const [conditions, setConditions] = useState<ModifierSelectionValues>({});
  const [trading, setTrading] = useState<TradingValue>(() => emptyTrading(view.character, true));
  const [payer, setPayer] = useState<PayerMode>();
  const [busy, setBusy] = useState(false);

  const negotiated = method === 'negotiated';
  const negotiator = negotiatorOf(trading, view.character, view.members);
  const tradingDto = negotiated ? tradingRequest(trading, negotiator, modifiers, 'purchase') : undefined;
  const factors = negotiated ? marketFactors(tables, 'purchase', conditions) : [];
  const lines = cart.map(cartLineDto);
  const { quote, error } = usePurchaseOrderQuote(
    cart.length
      ? {
          buyer: view.holder,
          lines,
          ...(factors.length ? { factors } : {}),
          ...(tradingDto ? { trading: tradingDto } : {}),
        }
      : undefined
  );
  const noDeal = quote?.trading?.pricePercent === null;
  const total = quote?.total ?? 0;

  const factionGold = view.faction?.management.availableGold ?? 0;
  const funds = (mode: PayerMode) =>
    !isCharacter || mode === 'holder'
      ? view.gold
      : !view.faction
        ? 0
        : mode === 'faction'
          ? factionGold
          : roundGold(view.gold + factionGold);
  const payers = isCharacter ? PAYER_MODES : (['holder'] as PayerMode[]);
  const enough = (mode: PayerMode) => !!quote && funds(mode) >= total;

  // The payer defaults to the first that covers the total, and is cleared when it no longer does
  useEffect(() => {
    if (step !== 2 || !quote) return;
    if (!payer || !enough(payer)) setPayer(payers.find(enough));
  }, [step, quote?.total]);

  useEffect(() => {
    if (cart.length === 0) onCancel();
  }, [cart.length]);

  const canNext = [cart.length > 0 && isCartValid(cart) && !!quote, !negotiated || !!tradingDto, false][step];

  const onPay = () => {
    if (!payer) return;
    setBusy(true);
    placePurchaseOrder(
      {
        buyer: view.holder,
        lines,
        ...(isCharacter ? { payer } : {}),
        ...(factors.length ? { factors } : {}),
        ...(tradingDto ? { trading: tradingDto } : {}),
      },
      auth
    )
      .then(() => {
        notify.success(t('purchase-done'));
        setCart([]);
        onDone();
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Stack spacing={2}>
            <CartLines cart={cart} setCart={setCart} quote={quote} />
            <Typography variant="caption" color="text.secondary">
              {t('checkout-cart-hint')}
            </Typography>
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <ChoiceCard
                selected={!negotiated}
                onSelect={() => setMethod('direct')}
                icon={<ShoppingBagIcon color="action" />}
                title={t('checkout-method-direct')}
              >
                <Typography variant="body2" color="text.secondary">
                  {t('checkout-method-direct-hint')}
                </Typography>
              </ChoiceCard>
              <ChoiceCard
                selected={negotiated}
                onSelect={() => setMethod('negotiated')}
                icon={<HandshakeIcon color="action" />}
                title={t('checkout-method-negotiated')}
              >
                <Typography variant="body2" color="text.secondary">
                  {t('checkout-method-negotiated-hint')}
                </Typography>
              </ChoiceCard>
            </Stack>
            {negotiated && (
              <>
                <Alert severity="info">{t('checkout-whole-cart-hint')}</Alert>
                <MarketConditions context="purchase" value={conditions} onChange={setConditions} />
                <Divider />
                <TradingFields
                  character={view.character}
                  members={view.members}
                  factionId={view.faction?.id}
                  context="purchase"
                  modifiers={modifiers}
                  value={trading}
                  onChange={setTrading}
                  alwaysOn
                />
              </>
            )}
            <CheckoutTotal quote={quote} />
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2}>
            <Typography variant="subtitle2">{t('checkout-payer')}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {payers.map((mode) => (
                <ChoiceCard
                  key={mode}
                  selected={payer === mode}
                  disabled={!enough(mode) || noDeal}
                  onSelect={() => setPayer(mode)}
                  title={isCharacter ? t(`payer-${mode}`) : t('payer-faction')}
                >
                  <MoneyDisplay gold={funds(mode)} variant="body2" />
                  {quote && !enough(mode) && (
                    <Typography variant="caption" color="error.main">
                      {t('err-insufficient-gold')}
                    </Typography>
                  )}
                </ChoiceCard>
              ))}
            </Stack>
            {isCharacter && payer && payer !== 'holder' && (
              <Typography variant="caption" color="text.secondary">
                {t('payer-faction-hint')}
              </Typography>
            )}
            {noDeal && (
              <Alert severity="error">
                {t(`trading-outcome-${quote?.trading?.outcome ?? 'no-agreement'}`)}: {t('checkout-no-deal-hint')}
              </Alert>
            )}
            <Typography variant="subtitle2">{t('checkout-summary')}</Typography>
            <Box>
              {quote?.lines.map((line) => {
                const item = cart.find((other) => other.item.id === line.itemTypeId)?.item;
                return (
                  <Accordion key={line.itemTypeId} disableGutters variant="outlined">
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1, minWidth: 0, pr: 1 }}>
                        {item && <ItemThumb item={item} size={32} />}
                        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                          {`${item ? t(item.name, item.name) : line.itemTypeId} × ${line.amount}`}
                        </Typography>
                        <MoneyDisplay gold={line.price.total} variant="body2" />
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <PriceBreakdownView price={line.price} />
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
            <CheckoutTotal quote={quote} funds={payer ? funds(payer) : undefined} />
          </Stack>
        )}

        {!!error && <Alert severity="warning">{t('price-quote-unavailable')}</Alert>}

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Button onClick={step === 0 ? onCancel : () => setStep(step - 1)} disabled={busy}>
            {step === 0 ? t('checkout-back-to-catalog') : t('back')}
          </Button>
          {step < 2 ? (
            <Button variant="contained" disabled={!canNext} onClick={() => setStep(step + 1)}>
              {t('next')}
            </Button>
          ) : (
            <Button variant="contained" disabled={busy || !quote || noDeal || !payer || !enough(payer)} onClick={onPay}>
              {t('checkout-pay')}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

/** The total of the order and, with `funds`, what is left after paying. */
const CheckoutTotal: FC<{ quote?: PurchaseOrderQuote; funds?: number }> = ({ quote, funds }) => {
  const { t } = useTranslation();
  const after = funds !== undefined && quote ? roundGold(funds - quote.total) : undefined;
  return (
    <Stack spacing={0.5}>
      <Divider />
      <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1 }}>
        <Typography sx={{ fontWeight: 700 }}>{t('price-total')}</Typography>
        {quote ? <MoneyDisplay gold={quote.total} /> : <Typography>…</Typography>}
      </Stack>
      {quote?.trading && quote.trading.pricePercent !== null && (
        <Typography variant="caption" color="text.secondary">
          {t('checkout-negotiated-percent', { total: quote.trading.total, percent: quote.trading.pricePercent })}
        </Typography>
      )}
      {after !== undefined && (
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {t('price-funds-after')}
          </Typography>
          <MoneyDisplay gold={after} color={after < 0 ? 'error.main' : undefined} />
        </Stack>
      )}
    </Stack>
  );
};

export default MarketCheckout;
