import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, Grid, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { CategorySeparator } from '@labcabrera-rmu/rmu-react-shared-lib';

export default function CharacterCreateSortCombat({
  items,
  onChange,
}: {
  items: string[];
  onChange?: (newOrder: string[]) => void;
}) {
  const { t } = useTranslation();
  const [order, setOrder] = useState<string[]>(items);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrder(newOrder);
    onChange?.(newOrder);
  };

  return (
    <Grid container spacing={1}>
      <CategorySeparator text={t('Weapon development order')} />
      <List>
        {order.map((item, i) => (
          <ListItem
            key={item}
            secondaryAction={
              <Box>
                <IconButton aria-label="up" size="small" onClick={() => moveItem(i, 'up')} disabled={i === 0}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="down"
                  size="small"
                  onClick={() => moveItem(i, 'down')}
                  disabled={i === order.length - 1}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <ListItemText primary={t(item)} />
          </ListItem>
        ))}
      </List>
    </Grid>
  );
}
