import React, { Dispatch, FC, SetStateAction } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { Card, CardContent, CardMedia, Grid, IconButton, InputAdornment, MenuItem, Select } from '@mui/material';
import { equipItem, unequipItem } from '../../api/character';
import { Character, CharacterItem } from '../../api/character.dto';

const EquipmentSlotCard: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  slot: string;
  itemId?: string;

  onClick?: () => void;
}> = ({ character, setCharacter, slot, itemId, onClick }) => {
  const maxWidth = 400;
  const minWidth = 400;
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

  const handleEquipmentChange = (event: any) => {
    const newItemId = event.target.value;
    equipItem(character.id, slot, newItemId)
      .then((data) => setCharacter(data))
      .catch((err) => console.error(err));
  };

  const handleUnequip = () => {
    unequipItem(character.id, slot)
      .then((data) => setCharacter(data))
      .catch((err) => console.error(err));
  };

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
        {/* <Grid container spacing={1} sx={{ padding: 1 }}>
          <Grid size={12}> */}
        {getSlotOptions(character, slot).length > 0 && (
          <Select
            value={character.equipment[slot] || ''}
            onChange={handleEquipmentChange}
            variant="standard"
            fullWidth
            sx={{ padding: 1 }}
            endAdornment={
              character.equipment[slot] && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnequip();
                    }}
                    size="small"
                    sx={{ mr: 4 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
          >
            {getSlotOptions(character, slot).map((option) => (
              <MenuItem key={option.id} value={option.id} selected={option.id === character.equipment[slot]}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        )}
        {/* </Grid>
        </Grid> */}
      </CardContent>
    </Card>
  );
};

export default EquipmentSlotCard;
