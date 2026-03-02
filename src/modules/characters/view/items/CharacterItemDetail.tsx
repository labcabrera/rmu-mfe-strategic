import React, { FC } from 'react';
import { Box, CardMedia, Divider, Grid, Typography, List, ListItem, ListItemText } from '@mui/material';
import { t } from 'i18next';
import { CharacterItem } from '../../../api/character.dto';

const CharacterItemDetail: FC<{ item?: CharacterItem }> = ({ item }) => {
  if (!item) return null;

  const getCost = () => {
    try {
      return item.info?.cost?.average ? `${item.info.cost.average}g` : '';
    } catch (e) {
      return '';
    }
  };

  return (
    <Box mt={2} sx={{ width: '100%', maxWidth: 800 }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={12}>
          <CardMedia
            component="img"
            image={`/static/images/items/${item.itemTypeId}.png`}
            alt={item.name}
            sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 1 }}
          />
        </Grid>

        <Grid size={12}>
          <Typography variant="h6">{item.name}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {item.itemTypeId ? t(item.itemTypeId) : ''}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <List dense>
            <ListItem>
              <ListItemText primary={t('type')} secondary={item.info?.type || ''} />
            </ListItem>
            {item.amount && item.amount > 1 && (
              <ListItem>
                <ListItemText primary={t('amount')} secondary={String(item.amount)} />
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary={t('weight')} secondary={item.info?.weight ?? ''} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('cost')} secondary={getCost()} />
            </ListItem>

            {item.weapon && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem>
                  <ListItemText primary={t('weapon-info')} secondary={`Hands: xxx}`} />
                </ListItem>
              </>
            )}

            {item.armor && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItem>
                  <ListItemText primary={t('armor-slot')} secondary={item.armor.slot || ''} />
                </ListItem>
              </>
            )}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CharacterItemDetail;
