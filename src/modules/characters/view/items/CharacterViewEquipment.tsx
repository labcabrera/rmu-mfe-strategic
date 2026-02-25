import React, { FC, useState } from 'react';
import { Box, CardMedia, Typography, Stack, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { Character, CharacterItem } from '../../../api/character.dto';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';

const imageBaseUrl = process.env.RMU_MFE_ASSETS!;
const slots = ['mainHand', 'offHand', 'head', 'body', 'arms', 'legs'];
const SLOT_SIZE = 150;

const CharacterViewEquipment: FC<{
  character: Character;
  setCharacter: (c: Character) => void;
}> = ({ character, setCharacter }) => {
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

  const getItemForSlot = (s: string): CharacterItem | null => {
    const id = (character.equipment as any)[s];
    if (!id) return null;
    return character.items.find((it) => it.id === id) || null;
  };

  return (
    <>
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="flex-start">
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
                borderRadius: 1,
                boxShadow: 3,
                bgcolor: 'background.paper',
              }}
              title={t(s)}
            >
              <Tooltip title={item ? item.name : t('no-item-equipped')} arrow>
                <CardMedia
                  component="img"
                  image={
                    item
                      ? `${imageBaseUrl}images/items/${item.itemTypeId}.png`
                      : `${imageBaseUrl}images/items/no-item.png`
                  }
                  alt={item ? item.name : t('empty')}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                />
              </Tooltip>
            </Box>
          );
        })}
      </Stack>

      <CharacterEquipmentDialog open={open} onClose={handleClose} character={character} slot={slot} onEquip={onEquip} />
    </>
  );
};

export default CharacterViewEquipment;
