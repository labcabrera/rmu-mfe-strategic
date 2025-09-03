/* eslint-disable react/prop-types */
import React from 'react';
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
import { equipItem, unequipItem } from '../../api/characters';

const EquipmentSlotDescription = ({ item }) => {
  if (!item) return null;

  if (item.weapon) {
    return (
      <>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Fumble: {item.weapon.fumble}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Size adjustment: {item.weapon.sizeAdjustment}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Required hands: {item.weapon.requiredHands}
        </Typography>
      </>
    );
  }
};

const EquipmentSlot = ({ character, setCharacter, slot, itemId }) => {
  const { t } = useTranslation();
  const item = character.equipment[slot] ? character.items.find((e) => e.id === itemId) : null;

  const getSlotOptions = (character, slot) => {
    if (slot === 'mainHand') {
      return character.items.filter((e) => e.category === 'weapon');
    } else if (slot === 'offHand') {
      return character.items.filter((e) => e.category === 'shield' || (e.category === 'weapon' && e.weapon && e.weapon.requiredHands < 2));
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

  const isArmorSlot = (item, slot) => {
    return item.armor && item.armor.slot === slot;
  };

  const handleEquipmentChange = (event) => {
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

  if (!item) {
    return (
      <Card sx={{ maxWidth: 220, minWidth: 220, minHeight: 500, maxHeight: 500 }}>
        <CardHeader title={t(slot)} />
        <CardMedia sx={{ height: 200 }} image={'/static/images/items/empty.png'} alt="No item equipped" title="No item equipped" />
        <CardContent sx={{ minHeight: 160, overflowY: 'auto' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No item equipped
          </Typography>
        </CardContent>
        <CardActions>
          {getSlotOptions(character, slot).length > 0 && (
            <Select onChange={(e) => handleEquipmentChange(e)} variant="standard" fullWidth>
              {getSlotOptions(character, slot).map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </CardActions>
      </Card>
    );
  }
  return (
    <Card sx={{ maxWidth: 220, minWidth: 220, minHeight: 500, maxHeight: 500 }}>
      <CardHeader
        action={
          <IconButton aria-label="settings" onClick={handleUnequip}>
            <ClearIcon />
          </IconButton>
        }
        title={t(slot)}
      />
      <CardMedia sx={{ height: 200 }} image={`/static/images/items/${item.itemTypeId}.png`} alt={item.name} title={item.name} />
      <CardContent sx={{ minHeight: 160, overflowY: 'auto' }}>
        <Typography gutterBottom variant="body2">
          {item.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t(item.itemTypeId)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {item.itemTypeId}
        </Typography>
        <EquipmentSlotDescription item={item} />
      </CardContent>
      <CardActions>
        {getSlotOptions(character, slot).length > 0 && (
          <Select value={character.equipment[slot]} onChange={(e) => handleEquipmentChange(e)} variant="standard" fullWidth>
            {getSlotOptions(character, slot).map((option) => (
              <MenuItem key={option.id} value={option.id} selected={option.id === character.equipment[slot]}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </CardActions>
    </Card>
  );
};

const CharacterViewEquipment = ({ character, setCharacter }) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('equipment')}
      </Typography>
      <Grid container spacing={2}>
        <EquipmentSlot character={character} setCharacter={setCharacter} slot="mainHand" itemId={character.equipment.mainHand} />
        <EquipmentSlot character={character} setCharacter={setCharacter} slot="offHand" itemId={character.equipment.offHand} />
        <EquipmentSlot character={character} setCharacter={setCharacter} slot="body" itemId={character.equipment.body} />
        <EquipmentSlot character={character} setCharacter={setCharacter} slot="head" itemId={character.equipment.head} />
        <EquipmentSlot character={character} setCharacter={setCharacter} slot="arms" itemId={character.equipment.arms} />
        <EquipmentSlot character={character} setCharacter={setCharacter} slot="legs" itemId={character.equipment.legs} />
        {/* <pre>Equipment:{JSON.stringify(character.equipment, null, 2)}</pre>
      <pre>Defense:{JSON.stringify(character.defense, null, 2)}</pre> */}
      </Grid>
    </>
  );
};

export default CharacterViewEquipment;
