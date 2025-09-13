import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@mui/icons-material/Clear';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { Character, CharacterItem, equipItem, unequipItem } from '../../api/characters';

const slots = ['mainHand', 'offHand', 'body', 'head', 'arms', 'legs'];

const CharacterViewEquipment: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('equipment')}
      </Typography>
      <Grid container spacing={2}>
        {slots.map((slot) => (
          <EquipmentSlot
            key={slot}
            character={character}
            setCharacter={setCharacter}
            slot={slot}
            itemId={character.equipment[slot]}
          />
        ))}
      </Grid>
    </>
  );
};

const EquipmentSlot: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  slot: string;
  itemId?: string;
}> = ({ character, setCharacter, slot, itemId }) => {
  const { t } = useTranslation();
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

  const maxWidth = 150;
  const minWidth = 150;
  const minHeight = 300;
  const maxHeight = 300;
  const imageHeight = 150;
  const imageMinHeight = 150;
  const headerMinHeight = 70;

  return (
    <Card sx={{ maxWidth: maxWidth, minWidth: minWidth, minHeight: minHeight, maxHeight: maxHeight }}>
      <CardHeader
        title={t(slot)}
        action={
          item && (
            <IconButton aria-label="settings" onClick={handleUnequip}>
              <ClearIcon />
            </IconButton>
          )
        }
        sx={{
          '& .MuiCardHeader-title': {
            fontSize: '1rem',
          },
          minHeight: headerMinHeight,
        }}
      />
      <CardMedia
        sx={{ height: imageHeight }}
        image={item ? `/static/images/items/${item.itemTypeId}.png` : '/static/images/items/empty.png'}
      />
      <CardContent sx={{ minHeight: imageMinHeight, overflowY: 'auto' }}>
        {getSlotOptions(character, slot).length > 0 && (
          <Select value={character.equipment[slot] || ''} onChange={handleEquipmentChange} variant="standard" fullWidth>
            {getSlotOptions(character, slot).map((option) => (
              <MenuItem key={option.id} value={option.id} selected={option.id === character.equipment[slot]}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </CardContent>
      <CardActions></CardActions>
    </Card>
  );
};

export default CharacterViewEquipment;
