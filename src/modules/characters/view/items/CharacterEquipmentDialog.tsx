import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Button, CardMedia, Tooltip } from '@mui/material';
import {
  Character,
  EquipmentSlot,
  RmuDialog,
  StrategicItem,
  equipItem,
  unequipItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';

const imageSize = 100;

export default function CharacterEquipmentDialog({
  open,
  character,
  items,
  slot,
  onClose,
  onEquip,
}: {
  open: boolean;
  character: Character;
  items: StrategicItem[];
  slot: EquipmentSlot | undefined;
  onClose: () => void;
  onEquip: (character: Character) => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const slotItemId = slot ? character.equipment.slots[slot] : undefined;

  const isArmorSlot = (item: StrategicItem, s: string) => {
    return item.armor && item.armor.slot === s;
  };

  const isOneHandedWeapon = (item: StrategicItem) => {
    return item.weapon && item.weapon.modes.filter((m) => m.type === 'one-hand').length > 0;
  };

  const getSlotOptions = (slot: EquipmentSlot | undefined): StrategicItem[] => {
    if (slot === 'mainHand') {
      return items.filter((e) => e.category === 'weapon');
    } else if (slot === 'offHand') {
      return items.filter((e) => e.category === 'shield' || (e.category === 'weapon' && isOneHandedWeapon(e)));
    } else if (slot === 'body' || slot === 'head' || slot === 'arms' || slot === 'legs') {
      return items.filter((e) => isArmorSlot(e, slot));
    }
    return [];
  };

  const slotOptions = useMemo(() => getSlotOptions(slot), [character, slot]);

  if (!slot) return null;

  const handleEquip = (item: StrategicItem | null) => {
    if (item) {
      equipItem(character.id, slot, item.id, auth)
        .then((data) => {
          if (onEquip) onEquip(data);
          onClose();
        })
        .catch((err) => showError(err.message));
    } else {
      unequipItem(character.id, slotItemId!, auth)
        .then((data) => {
          if (onEquip) onEquip(data);
          onClose();
        })
        .catch((err) => showError(err.message));
    }
  };

  const buttons = [<Button onClick={onClose}>{t('cancel')}</Button>];

  return (
    <RmuDialog open={open} title={t(slot)} buttons={buttons}>
      <>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
          <Box
            onClick={() => handleEquip(null)}
            sx={{
              width: imageSize,
              height: imageSize,
              cursor: 'pointer',
              border: slotItemId ? undefined : '2pt solid',
              borderColor: slotItemId ? undefined : 'success.main',
            }}
          >
            <CardMedia
              component="img"
              image={`${imageBaseUrl}images/items/no-item.png`}
              alt={t('none')}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: itemFilter }}
            />
          </Box>

          {slotOptions.map((item) => {
            const isEquipped = slotItemId === item.id;
            return (
              <Box
                key={item.id}
                onClick={() => handleEquip(item)}
                sx={{
                  width: imageSize,
                  height: imageSize,
                  cursor: 'pointer',
                  border: isEquipped ? '2pt solid' : undefined,
                  borderColor: isEquipped ? 'success.main' : undefined,
                }}
              >
                <Tooltip title={item.name} arrow>
                  <CardMedia
                    component="img"
                    image={`${imageBaseUrl}images/items/${item.itemTypeId}.png`}
                    alt={item.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: itemFilter,
                    }}
                  />
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </>
    </RmuDialog>
  );
}
