/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useParams, useSearchParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  EmptyState,
  Item,
  ItemInventory,
  ItemThumb,
  MoneyDisplay,
  NotFound,
  NumericInput,
  PayerMode,
  PriceQuote,
  purchaseItem,
  quoteItemPrice,
  roundGold,
  StrategicItem,
  TradingRequest,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CatalogBrowser, { useCatalog } from './CatalogBrowser';
import EconomyLayout from './EconomyLayout';
import { holderNames } from './HolderInventory';
import ItemLedgerList from './ItemLedgerList';
import { SellItemDialog } from './ItemOperationDialogs';
import { TradingFields } from './TradingFields';
import { GOLD_COIN, HolderView, useHolder } from './use-holder';

type MarketTab = 'buy' | 'sell' | 'history';
const TABS: MarketTab[] = ['buy', 'sell', 'history'];

type CartLine = { item: Item; amount: number };
const PAYER_MODES: PayerMode[] = ['holder', 'faction', 'split'];
/** Items of a type that does not stack one purchase creates (strategic, spec 041). */
const MAX_ITEMS_PER_PURCHASE = 100;

/**
 * The market of a character or a faction (spec 023, decision 14): buy from the catalog with a cart and a price
 * breakdown, sell the items of the holder, and the ledger of its operations.
 */
export default function MarketPage() {
  const { t } = useTranslation();
  const { holderKind, holderId } = useParams<{ holderKind: string; holderId: string }>();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((value) => value === params.get('tab')) ?? 'buy') as MarketTab;
  const { view, refresh, invalid, error } = useHolder(holderKind, holderId);
  const [refreshKey, setRefreshKey] = useState(0);
  const reload = () => {
    refresh();
    setRefreshKey((key) => key + 1);
  };

  if (invalid) return <NotFound />;

  return (
    <EconomyLayout page="market" view={view} error={error} onRetry={refresh}>
      {view && (
        <>
          <Tabs
            value={tab}
            onChange={(_, value: MarketTab) => setParams({ tab: value }, { replace: true })}
            variant="scrollable"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {TABS.map((value) => (
              <Tab key={value} value={value} label={t(`market-tab-${value}`)} />
            ))}
          </Tabs>
          {tab === 'buy' && <MarketBuy view={view} onDone={reload} />}
          {tab === 'sell' && <MarketSell view={view} onDone={reload} />}
          {tab === 'history' && (
            <ItemLedgerList
              rsql={`holderIds==${view.holder.id}`}
              perspective={view.holder}
              names={holderNames(view)}
              refreshKey={refreshKey}
            />
          )}
        </>
      )}
    </EconomyLayout>
  );
}

const MarketBuy: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const catalog = useCatalog();
  const [cart, setCart] = useState<CartLine[]>([]);

  // Spec 041: what the book sells in lots (20 arrows) goes in by lots
  const add = (item: Item) => {
    const lot = item.info.lotSize && item.info.lotSize > 1 ? item.info.lotSize : 1;
    setCart((lines) =>
      lines.some((line) => line.item.id === item.id)
        ? lines.map((line) => (line.item.id === item.id ? { ...line, amount: line.amount + lot } : line))
        : [...lines, { item, amount: lot }]
    );
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: 2, alignItems: 'start' }}>
      <CatalogBrowser catalog={catalog} onSelect={add} />
      <Box sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>
        <MarketCart view={view} cart={cart} setCart={setCart} onDone={onDone} />
      </Box>
    </Box>
  );
};

const MarketCart: FC<{
  view: HolderView;
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  onDone: () => void;
}> = ({ view, cart, setCart, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const isCharacter = view.holder.kind === 'character';
  const [payer, setPayer] = useState<PayerMode>('holder');
  const [trading, setTrading] = useState<TradingRequest>();
  const [quotes, setQuotes] = useState<Record<string, PriceQuote>>({});
  const [busy, setBusy] = useState(false);
  const key = JSON.stringify({ cart: cart.map((line) => [line.item.id, line.amount]), trading });

  useEffect(() => {
    if (cart.length === 0) return setQuotes({});
    let active = true;
    const timer = setTimeout(() => {
      Promise.all(
        cart.map((line) =>
          quoteItemPrice(
            { kind: 'purchase', itemTypeId: line.item.id, holder: view.holder, amount: line.amount, trading },
            auth
          ).then((quote) => [line.item.id, quote] as const)
        )
      )
        .then((entries) => active && setQuotes(Object.fromEntries(entries)))
        .catch(notify.error);
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);

  const total = roundGold(cart.reduce((sum, line) => sum + (quotes[line.item.id]?.price.total ?? 0), 0));
  const factionGold = view.faction?.management.availableGold ?? 0;
  const funds = !isCharacter
    ? view.gold
    : payer === 'holder'
      ? view.gold
      : payer === 'faction'
        ? factionGold
        : roundGold(view.gold + factionGold);
  const after = roundGold(funds - total);

  const onBuy = async () => {
    setBusy(true);
    try {
      for (const line of cart) {
        await purchaseItem(
          {
            buyer: view.holder,
            itemTypeId: line.item.id,
            amount: line.amount,
            ...(isCharacter ? { payer } : {}),
            ...(trading ? { trading } : {}),
          },
          auth
        );
        setCart((lines) => lines.filter((other) => other.item.id !== line.item.id));
      }
      notify.success(t('purchase-done'));
    } catch (e) {
      notify.error(e);
    } finally {
      setBusy(false);
      onDone();
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ShoppingCartIcon color="action" />
          <Typography variant="overline" color="text.secondary">
            {t('cart')}
          </Typography>
        </Stack>
        {cart.length === 0 && <EmptyState title={t('cart-empty')} description={t('cart-empty-hint')} />}
        {cart.map((line) => (
          <Stack key={line.item.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ItemThumb item={line.item} size={40} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {t(line.item.name, line.item.name)}
              </Typography>
              {quotes[line.item.id] ? (
                <MoneyDisplay gold={quotes[line.item.id].price.total} variant="caption" />
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
        ))}
        {cart.length > 0 && (
          <>
            <Divider />
            {isCharacter && (
              <TextField
                select
                size="small"
                label={t('payer')}
                value={payer}
                onChange={(e) => setPayer(e.target.value as PayerMode)}
              >
                {PAYER_MODES.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {t(`payer-${mode}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {isCharacter && payer !== 'holder' && (
              <Typography variant="caption" color="text.secondary">
                {t('payer-faction-hint')}
              </Typography>
            )}
            <TradingFields character={view.character} onChange={setTrading} />
            <Divider />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700 }}>{t('price-total')}</Typography>
              <MoneyDisplay gold={total} />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {t('price-funds-after')}
              </Typography>
              <MoneyDisplay gold={after} color={after < 0 ? 'error.main' : undefined} />
            </Stack>
            {after < 0 && <Alert severity="warning">{t('err-insufficient-gold')}</Alert>}
            <Button
              variant="contained"
              disabled={busy || after < 0 || Object.keys(quotes).length < cart.length}
              onClick={onBuy}
            >
              {t('buy')}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
};

const MarketSell: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const { t } = useTranslation();
  const [item, setItem] = useState<StrategicItem>();
  const equipped = Object.values(view.character?.equipment.slots ?? {}).filter((id): id is string => !!id);
  return (
    <>
      <ItemInventory
        items={view.items}
        equippedIds={equipped}
        hideItemTypeIds={[GOLD_COIN]}
        onSelect={(selected) => !equipped.includes(selected.id) && setItem(selected)}
        actions={(selected) => [
          { key: 'sell', label: t('sell'), onClick: setItem, disabled: equipped.includes(selected.id) },
        ]}
      />
      {item && (
        <SellItemDialog
          item={item}
          view={view}
          onClose={() => setItem(undefined)}
          onDone={() => {
            setItem(undefined);
            onDone();
          }}
        />
      )}
    </>
  );
};
