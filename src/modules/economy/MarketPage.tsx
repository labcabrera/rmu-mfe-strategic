import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { Alert, Box, Button, Divider, Paper, Stack, Tab, Tabs, Theme, Typography, useMediaQuery } from '@mui/material';
import {
  EmptyState,
  Item,
  ItemCatalogBrowser,
  itemCatalogFilters,
  ItemInventory,
  MoneyDisplay,
  NotFound,
  StrategicItem,
  useItemCatalog,
  useListFilters,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import EconomyLayout from './EconomyLayout';
import { holderNames } from './HolderInventory';
import ItemLedgerList from './ItemLedgerList';
import { SellItemDialog } from './ItemOperationDialogs';
import MarketCheckout, { CartLine, CartLines, usePurchaseOrderQuote } from './MarketCheckout';
import { GOLD_COIN, HolderView, useHolder } from './use-holder';

type MarketTab = 'buy' | 'sell' | 'history';
const TABS: MarketTab[] = ['buy', 'sell', 'history'];

/**
 * The market of a character or a faction (spec 023, decision 14): buy from the catalog with a cart checked out in
 * steps (spec 048), sell the items of the holder, and the ledger of its operations.
 */
export default function MarketPage() {
  const { t } = useTranslation();
  const { holderKind, holderId } = useParams<{ holderKind: string; holderId: string }>();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((value) => value === params.get('tab')) ?? 'buy') as MarketTab;
  const { view, refresh, invalid, error } = useHolder(holderKind, holderId);
  const [refreshKey, setRefreshKey] = useState(0);
  // The cart and the checkout step live here, so they survive the switch between tabs (spec 056, decision 9)
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkout, setCheckout] = useState(false);
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
            onChange={(_, value: MarketTab) =>
              // Merge into the query, which also holds the filters of the catalog (spec 056, B-04)
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  next.set('tab', value);
                  return next;
                },
                { replace: true }
              )
            }
            variant="scrollable"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {TABS.map((value) => (
              <Tab key={value} value={value} label={t(`market-tab-${value}`)} />
            ))}
          </Tabs>
          {tab === 'buy' && (
            <MarketBuy
              view={view}
              cart={cart}
              setCart={setCart}
              checkout={checkout}
              setCheckout={setCheckout}
              onDone={reload}
            />
          )}
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

/** Cards of the catalog: as many per row as fit at this width, whatever the side column leaves. */
const MARKET_CARD_MIN_WIDTH = 200;

const MarketBuy: FC<{
  view: HolderView;
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  checkout: boolean;
  setCheckout: React.Dispatch<React.SetStateAction<boolean>>;
  onDone: () => void;
}> = ({ view, cart, setCart, checkout, setCheckout, onDone }) => {
  const { t } = useTranslation();
  const filters = useListFilters<Item>(itemCatalogFilters(t));
  const { items, error, truncated, refresh } = useItemCatalog({ exclude: [GOLD_COIN] });
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  // Spec 041: what the book sells in lots (20 arrows) goes in by lots
  const add = (item: Item) => {
    const lot = item.info.lotSize && item.info.lotSize > 1 ? item.info.lotSize : 1;
    setCart((lines) =>
      lines.some((line) => line.item.id === item.id)
        ? lines.map((line) => (line.item.id === item.id ? { ...line, amount: line.amount + lot } : line))
        : [...lines, { item, amount: lot }]
    );
  };

  if (checkout)
    return (
      <MarketCheckout
        view={view}
        cart={cart}
        setCart={setCart}
        onCancel={() => setCheckout(false)}
        onDone={() => {
          setCheckout(false);
          onDone();
        }}
      />
    );

  const marketCart = <MarketCart view={view} cart={cart} setCart={setCart} onCheckout={() => setCheckout(true)} />;
  const browser = (
    <ItemCatalogBrowser
      items={items}
      filters={filters}
      layout={wide ? 'side' : 'drawer'}
      onSelect={add}
      cardMinWidth={MARKET_CARD_MIN_WIDTH}
      panelHeader={wide ? marketCart : undefined}
      panelWidth={300}
      truncated={truncated}
      error={error}
      refresh={refresh}
      storageKey="strategic.market"
    />
  );
  // From lg the cart heads the side column of the filters, like the item list; below, the filters go in a drawer
  if (wide) return browser;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 320px' }, gap: 2, alignItems: 'start' }}>
      {browser}
      <Box sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>{marketCart}</Box>
    </Box>
  );
};

/** The cart next to the catalog: its lines, the price of a direct purchase and the button to check out. */
const MarketCart: FC<{
  view: HolderView;
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  onCheckout: () => void;
}> = ({ view, cart, setCart, onCheckout }) => {
  const { t } = useTranslation();
  const { quote, error } = usePurchaseOrderQuote(
    cart.length
      ? { buyer: view.holder, lines: cart.map((line) => ({ itemTypeId: line.item.id, amount: line.amount })) }
      : undefined
  );

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
        <CartLines cart={cart} setCart={setCart} quote={quote} />
        {cart.length > 0 && (
          <>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700 }}>{t('cart-direct-total')}</Typography>
              {quote ? <MoneyDisplay gold={quote.total} /> : <Typography>…</Typography>}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t('cart-direct-total-hint')}
            </Typography>
            {!!error && <Alert severity="warning">{t('price-quote-unavailable')}</Alert>}
            <Button variant="contained" startIcon={<ShoppingCartCheckoutIcon />} onClick={onCheckout}>
              {t('checkout')}
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
