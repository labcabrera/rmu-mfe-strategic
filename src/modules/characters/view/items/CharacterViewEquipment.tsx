import React, { FC, useState } from 'react';
import { Box, CardMedia, Stack, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import { StrategicItem } from '../../../api/strategic-item.dto';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';

const slots = ['mainHand', 'offHand', 'head', 'body', 'arms', 'legs'];
const SLOT_SIZE = 100;

const CharacterViewEquipment: FC<{
  character: Character;
  items: StrategicItem[];
  setCharacter: (c: Character) => void;
}> = ({ character, items, setCharacter }) => {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<string>('');

  const handleOpen = (s: string) => {
    setSlot(s);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const onEquip = (updated: Character) => {
    setCharacter(updated);
  };

  const getItemForSlot = (s: string): StrategicItem | null => {
    const id = (character.equipment as any)[s];
    if (!id) return null;
    return items.find((it) => it.id === id) || null;
  };

  if (!character || !items) return <p>Loading...</p>;

  return (
    <>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="flex-start">
        {slots.map((s) => {
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
