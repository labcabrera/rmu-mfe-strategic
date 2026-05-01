import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from '@mui/material';
import { fetchItems, Item } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../ErrorContext';

const TradeViewItemSearch: FC<{ onItemSelect?: (item: Item) => void }> = ({ onItemSelect }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const [items, setItems] = useState<Item[]>([]);

  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | ''>('');

  useEffect(() => {
    fetchItems('', 0, 200, auth)
      .then((data) => setItems(data.content))
      .catch((err) => showError(err.message));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.info?.type) set.add(it.info.type);
      else if (it.itemTypeId) set.add(it.itemTypeId);
    });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (nameFilter && !it.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (categoryFilter) {
        const cat = it.info?.type || it.itemTypeId || '';
        if (cat !== categoryFilter) return false;
      }
      return true;
    });
  }, [items, nameFilter, categoryFilter]);

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label={t('name')} value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth>
          <InputLabel>{t('category')}</InputLabel>
          <Select
            value={categoryFilter}
            label={t('category')}
            onChange={(e) => setCategoryFilter(e.target.value as string)}
          >
            <MenuItem value="">{t('all')}</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {t(c) || c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => {
            setNameFilter('');
            setCategoryFilter('');
          }}
        >
          {t('clear')}
        </Button>
        <Typography variant="body2" sx={{ ml: 1 }}>
          {filtered.length} {t('results')}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Grid container spacing={2}>
          {filtered.map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={item.imageUrl || `/static/images/items/${item.itemTypeId}.png`}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.info?.type || t(item.itemTypeId) || ''}
                  </Typography>
                </CardContent>
                <Button onClick={() => onItemSelect && onItemSelect(item)}>{t('select')}</Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TradeViewItemSearch;
