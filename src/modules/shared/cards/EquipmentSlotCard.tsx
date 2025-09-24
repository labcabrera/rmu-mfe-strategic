import React, { Dispatch, FC, SetStateAction } from 'react';
import { Card, CardContent, CardMedia, Autocomplete, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { equipItem, unequipItem } from '../../api/character';
import { Character, CharacterItem } from '../../api/character.dto';

const EquipmentSlotCard: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  slot: string;
  itemId?: string;
  onClick?: () => void;
}> = ({ character, setCharacter, slot, itemId, onClick }) => {
  const maxWidth = 390;
  const minWidth = 390;
  const height = 80;
  const imageSize = 80;

  const item = character.equipment[slot] ? character.items.find((e) => e.id === itemId) : null;

  const isArmorSlot = (item: CharacterItem, slot: string) => {
    return item.armor && item.armor.slot === slot;
  };

  const getSlotOptions = (character: Character, slot: string): CharacterItem[] => {
    if (slot === 'mainHand') {
      return character.items.filter((e) => e.category === 'weapon');
    } else if (slot === 'offHand') {
      return character.items.filter(
        (e) => e.category === 'shield' || (e.category === 'weapon' && e.weapon && e.weapon.requiredHands < 2)
      );
    } else if (slot === 'body') {
      return character.items.filter((e) => isArmorSlot(e, 'body'));
    } else if (slot === 'head') {
      return character.items.filter((e) => isArmorSlot(e, 'head'));
    } else if (slot === 'arms') {
      return character.items.filter((e) => isArmorSlot(e, 'arms'));
    } else if (slot === 'legs') {
      return character.items.filter((e) => isArmorSlot(e, 'legs'));
    }
    return [];
  };

  const handleEquipmentChange = (_event: React.SyntheticEvent, newValue: CharacterItem | null) => {
    if (newValue) {
      equipItem(character.id, slot, newValue.id)
        .then((data) => setCharacter(data))
        .catch((err) => console.error(err));
    } else {
      handleUnequip();
    }
  };

  const handleUnequip = () => {
    unequipItem(character.id, slot)
      .then((data) => setCharacter(data))
      .catch((err) => console.error(err));
  };

  const selectedItem = character.equipment[slot]
    ? getSlotOptions(character, slot).find((option) => option.id === character.equipment[slot]) || null
    : null;

  const slotOptions = getSlotOptions(character, slot);

  return (
    <Card
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        maxWidth: { maxWidth },
        minWidth: { minWidth },
        height: { height },
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, background 0.2s',
        '&:hover': {
          boxShadow: 6,
          backgroundColor: 'action.hover',
        },
      }}
    >
      <CardMedia
        component="img"
        image={item ? `/static/images/items/${item.itemTypeId}.png` : '/static/images/items/empty.png'}
        alt={item ? item.name : 'Empty Slot'}
        sx={{ width: imageSize, height: imageSize, objectFit: 'cover' }}
      />
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ml: 2,
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        {slotOptions.length > 0 ? (
          <Autocomplete
            options={slotOptions}
            getOptionLabel={(option) => option.name}
            value={selectedItem}
            onChange={handleEquipmentChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} variant="standard" placeholder={t(slot)} sx={{ padding: 1 }} />
            )}
          />
        ) : (
          <Typography variant="body1" color="secondary">
            {t(slot)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentSlotCard;
