import React, { FC, useState } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { t } from 'i18next';

export const CharacterCreateSortCombat: FC<{
  items: string[];
  onChange?: (newOrder: string[]) => void;
}> = ({ items, onChange }) => {
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
    <>
      <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 5 }}>
        {t('combat-development-order')}
      </Typography>
      <List>
        {order.map((item, i) => (
          <ListItem
            key={item}
            secondaryAction={
              <Box>
                <IconButton aria-label="Subir" size="small" onClick={() => moveItem(i, 'up')} disabled={i === 0}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Bajar"
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
    </>
  );
};
