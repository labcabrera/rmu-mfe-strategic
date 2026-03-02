import React, { FC, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CardMedia,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material';
import { t } from 'i18next';
import { equipItem, unequipItem } from '../../../api/character';
import { Character, CharacterItem } from '../../../api/character.dto';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;

const CharacterEquipmentDialog: FC<{
  open: boolean;
  onClose: () => void;
  character: Character;
  slot: string;
  onEquip?: (character: Character) => void;
}> = ({ open, onClose, character, slot, onEquip }) => {
  const isArmorSlot = (item: CharacterItem, s: string) => {
    return item.armor && item.armor.slot === s;
  };

  const isOneHandedWeapon = (item: CharacterItem) => {
    return item.weapon && item.weapon.modes.filter((m) => m.type === 'one-hand').length > 0;
  };

  const getSlotOptions = (character: Character, s: string): CharacterItem[] => {
    if (s === 'mainHand') {
      return character.items.filter((e) => e.category === 'weapon');
    } else if (s === 'offHand') {
      return character.items.filter(
        (e) => e.category === 'shield' || (e.category === 'weapon' && isOneHandedWeapon(e))
      );
    } else if (s === 'body') {
      return character.items.filter((e) => isArmorSlot(e, 'body'));
    } else if (s === 'head') {
      return character.items.filter((e) => isArmorSlot(e, 'head'));
    } else if (s === 'arms') {
      return character.items.filter((e) => isArmorSlot(e, 'arms'));
    } else if (s === 'legs') {
      return character.items.filter((e) => isArmorSlot(e, 'legs'));
    }
    return [];
  };

  const slotOptions = useMemo(() => getSlotOptions(character, slot), [character, slot]);

  const selectedItem: CharacterItem | null = useMemo(() => {
    return character.equipment[slot]
      ? slotOptions.find((option) => option.id === character.equipment[slot]) || null
      : null;
  }, [character, slot, slotOptions]);

  const handleEquip = (item: CharacterItem | null) => {
    if (item) {
      equipItem(character.id, slot, item.id)
        .then((data) => {
          if (onEquip) onEquip(data);
          onClose();
        })
        .catch((err) => console.error(err));
    } else {
      unequipItem(character.id, slot)
        .then((data) => {
          if (onEquip) onEquip(data);
          onClose();
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center">
          <CardMedia
            component="img"
            image={`${imageBaseUrl}images/items/no-item.png`}
            sx={{ width: 40, height: 40, verticalAlign: 'middle', marginRight: 1 }}
          />
          <Typography variant="h6" component="div">
            {t(slot)}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          <Box
            onClick={() => handleEquip(null)}
            sx={{
              width: 100,
              height: 100,
              cursor: 'pointer',
              border: !character.equipment[slot] ? `2px solid` : 'none',
              borderColor: 'success.main',
              borderRadius: 1,
            }}
          >
            <CardMedia
              component="img"
              image={`${imageBaseUrl}images/items/no-item.png`}
              alt={t('none')}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
            />
          </Box>

          {slotOptions.map((item) => {
            const isEquipped = !!character.equipment[slot] && character.equipment[slot] === item.id;
            return (
              <Box
                key={item.id}
                onClick={() => handleEquip(item)}
                sx={{
                  width: 100,
                  height: 100,
                  cursor: 'pointer',
                  border: isEquipped ? `2px solid` : 'none',
                  borderColor: 'success.main',
                  borderRadius: 1,
                }}
              >
                <Tooltip title={item.name} arrow>
                  <CardMedia
                    component="img"
                    image={`${imageBaseUrl}images/items/${item.itemTypeId}.png`}
                    alt={item.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                  />
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterEquipmentDialog;
