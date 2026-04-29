import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CardMedia, Stack, Tooltip } from '@mui/material';
import { Character, EQUIPMENT_SLOTS, EquipmentSlot, StrategicItem } from '@labcabrera-rmu/rmu-react-shared-lib';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';

const SLOT_SIZE = 100;

const CharacterViewEquipment: FC<{
  character: Character;
  items: StrategicItem[];
  setCharacter: (c: Character) => void;
}> = ({ character, items, setCharacter }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<EquipmentSlot>();

  const handleOpen = (s: EquipmentSlot) => {
    setSlot(s);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const onEquip = (updated: Character) => {
    setCharacter(updated);
  };

  const getItemForSlot = (slot: EquipmentSlot): StrategicItem | null => {
    const id = character.equipment.slots[slot] || null;
    if (!id) return null;
    return items.find((it) => it.id === id) || null;
  };

  if (!character || !items) return <p>Loading...</p>;

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {EQUIPMENT_SLOTS.map((s) => {
          const item = getItemForSlot(s);
          return (
            <Box
              key={s}
              onClick={() => handleOpen(s)}
              sx={{
                width: `${SLOT_SIZE}px`,
                height: `${SLOT_SIZE}px`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={t(s)}
            >
              <Tooltip title={item ? item.name : t('No item equipped')} arrow>
                <CardMedia
                  component="img"
                  image={
                    item
                      ? `${imageBaseUrl}images/items/${item.itemTypeId}.png`
                      : `${imageBaseUrl}images/items/no-item.png`
                  }
                  alt={item ? item.name : t('empty')}
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
      </Stack>

      <CharacterEquipmentDialog
        open={open}
        character={character}
        items={items}
        slot={slot}
        onEquip={onEquip}
        onClose={handleClose}
      />
    </>
  );
};

export default CharacterViewEquipment;
