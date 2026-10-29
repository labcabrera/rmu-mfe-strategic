import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { Alert, Box, Button, Divider, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
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

/** Cards of the catalog next to the cart: two per row up to `lg`. */
const MARKET_CARD_SIZE = { xs: 6, sm: 4, md: 6, lg: 4, xl: 3 };

const MarketBuy: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const { t } = useTranslation();
  const filters = useListFilters<Item>(itemCatalogFilters(t));
  const { items, error, truncated, refresh } = useItemCatalog({ exclude: [GOLD_COIN] });
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkout, setCheckout] = useState(false);

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

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: 2, alignItems: 'start' }}>
      <ItemCatalogBrowser
        items={items}
        filters={filters}
        layout="drawer"
        onSelect={add}
        cardSize={MARKET_CARD_SIZE}
        truncated={truncated}
        error={error}
        refresh={refresh}
        storageKey="strategic.market"
      />
      <Box sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>
        <MarketCart view={view} cart={cart} setCart={setCart} onCheckout={() => setCheckout(true)} />
      </Box>
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
