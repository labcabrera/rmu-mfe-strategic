/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Card, CardActionArea, Chip, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import {
  EmptyState,
  fetchItems,
  imageBaseUrl,
  Item,
  ITEM_RARITIES,
  itemFilter,
  ItemThumb,
  LoadingState,
  MoneyDisplay,
  SearchField,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { GOLD_COIN } from './use-holder';

const PAGE_SIZE = 24;
const RARITY_COLORS: Record<string, 'default' | 'info' | 'secondary' | 'warning'> = {
  common: 'default',
  uncommon: 'info',
  rare: 'secondary',
  'very-rare': 'warning',
};

/** Subcategory of a catalog item: the weapon skill or the armor slot. */
const subcategoryOf = (item: Item): string | undefined =>
  item.category === 'weapon' ? item.weapon?.skillId : item.category === 'armor' ? item.armor?.slot : undefined;

/** Image of a category or subcategory filter (`images/items/category-<key>.png`). */
const CategoryChip: FC<{ value: string; selected: boolean; onClick: () => void }> = ({ value, selected, onClick }) => {
  const { t } = useTranslation();
  return (
    <Chip
      label={t(value)}
      onClick={onClick}
      color={selected ? 'primary' : 'default'}
      variant={selected ? 'filled' : 'outlined'}
      avatar={
        <Box
          component="img"
          src={`${imageBaseUrl}images/items/category-${value}.png`}
          alt=""
          onError={(event) => ((event.target as HTMLImageElement).style.visibility = 'hidden')}
          sx={{ filter: itemFilter, objectFit: 'cover', borderRadius: '50%' }}
        />
      }
    />
  );
};

/** Catalog of rmu-api-items, loaded whole once (≤ 1000 items). */
export function useCatalog() {
  const auth = useAuth();
  const notify = useNotify();
  const [items, setItems] = useState<Item[]>();
  useEffect(() => {
    fetchItems('', 0, 1000, auth)
      .then((page) => setItems(page.content.filter((item) => item.id !== GOLD_COIN)))
      .catch(notify.error);
  }, []);
  return items;
}

/**
 * The item catalog as a grid of cards (spec 023, decision 14): search by name, category and subcategory chips, armor
 * type and rarity, with the rarity and the average price of each item. `extra` adds content to a card, such as the
 * price for the buyer or the production hours.
 */
const CatalogBrowser: FC<{
  catalog: Item[] | undefined;
  onSelect: (item: Item) => void;
  selectedId?: string;
  extra?: (item: Item) => ReactNode;
}> = ({ catalog, onSelect, selectedId, extra }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>();
  const [subcategory, setSubcategory] = useState<string>();
  const [at, setAt] = useState('');
  const [rarity, setRarity] = useState('');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => [...new Set((catalog ?? []).map((item) => item.category))].sort(), [catalog]);
  const subcategories = useMemo(
    () =>
      [
        ...new Set(
          (catalog ?? [])
            .filter((item) => item.category === category)
            .map(subcategoryOf)
            .filter((value): value is string => !!value)
        ),
      ].sort(),
    [catalog, category]
  );
  const armorTypes = useMemo(
    () =>
      [...new Set((catalog ?? []).filter((item) => item.armor).map((item) => item.armor!.at))].sort((a, b) => a - b),
    [catalog]
  );

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return (catalog ?? [])
      .filter((item) => !category || item.category === category)
      .filter((item) => !subcategory || subcategoryOf(item) === subcategory)
      .filter((item) => !at || `${item.armor?.at}` === at)
      .filter((item) => !rarity || item.info.rarity === rarity)
      .filter((item) => !text || t(item.name, item.name).toLowerCase().includes(text) || item.id.includes(text))
      .sort((a, b) => t(a.name, a.name).localeCompare(t(b.name, b.name)));
  }, [catalog, search, category, subcategory, at, rarity]);

  useEffect(() => setPage(1), [search, category, subcategory, at, rarity]);

  if (!catalog) return <LoadingState />;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Box sx={{ flex: 1 }}>
          <SearchField value={search} onChange={setSearch} label={t('search-items')} />
        </Box>
        <TextField
          select
          size="small"
          label={t('rarity')}
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">{t('all')}</MenuItem>
          {ITEM_RARITIES.map((value) => (
            <MenuItem key={value} value={value}>
              {t(value)}
            </MenuItem>
          ))}
        </TextField>
        {category === 'armor' && (
          <TextField
            select
            size="small"
            label={t('armor-type')}
            value={at}
            onChange={(e) => setAt(e.target.value)}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="">{t('all')}</MenuItem>
            {armorTypes.map((value) => (
              <MenuItem key={value} value={`${value}`}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
        {categories.map((value) => (
          <CategoryChip
            key={value}
            value={value}
            selected={category === value}
            onClick={() => {
              setCategory(category === value ? undefined : value);
              setSubcategory(undefined);
              setAt('');
            }}
          />
        ))}
      </Stack>
      {subcategories.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
          {subcategories.map((value) => (
            <CategoryChip
              key={value}
              value={value}
              selected={subcategory === value}
              onClick={() => setSubcategory(subcategory === value ? undefined : value)}
            />
          ))}
        </Stack>
      )}
      {visible.length === 0 ? (
        <EmptyState title={t('catalog-empty')} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 1,
          }}
        >
          {visible.map((item) => (
            <Card
              key={item.id}
              variant="outlined"
              sx={{ borderColor: item.id === selectedId ? 'primary.main' : undefined }}
            >
              <CardActionArea onClick={() => onSelect(item)} sx={{ p: 1, height: '100%' }}>
                <Stack spacing={0.75} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <ItemThumb item={item} size={72} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t(item.name, item.name)}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', justifyContent: 'center' }} useFlexGap>
                    <Chip size="small" label={t(item.info.rarity)} color={RARITY_COLORS[item.info.rarity]} />
                    {item.armor && <Chip size="small" variant="outlined" label={`${t('at')} ${item.armor.at}`} />}
                  </Stack>
                  {extra ? extra(item) : <MoneyDisplay gold={item.info.cost?.average ?? 0} />}
                  {item.info.weight !== null && (
                    <Typography variant="caption" color="text.secondary">
                      {`${item.info.weight} ${t('lbs')}`}
                    </Typography>
                  )}
                </Stack>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
      {pages > 1 && (
        <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} sx={{ alignSelf: 'center' }} />
      )}
    </Stack>
  );
};

export default CatalogBrowser;
