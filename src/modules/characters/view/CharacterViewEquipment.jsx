/* eslint-disable react/prop-types */
import React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { equipItem } from '../../api/characters';

const EquipmentSlot = ({ character, setCharacter, slot, itemId }) => {
  const item = character.equipment[slot] ? character.items.find((e) => e.id === itemId) : null;

  const getSlotOptions = (character, slot) => {
    if (slot === 'mainHand') {
      return character.items.filter((e) => e.category === 'weapon');
    } else if (slot === 'offHand') {
      return character.items.filter((e) => e.category === 'shield' || e.category === 'weapon');
    } else if (slot === 'body') {
      return character.items.filter((e) => e.category === 'armor');
    }
    return [];
  };

  const handleEquipmentChange = (event) => {
    const newItemId = event.target.value;
    console.log(`Change ${slot} to: ${newItemId}`);
    equipItem(character.id, slot, newItemId)
      .then((data) => setCharacter(data))
      .catch((err) => console.error(err));
  };

  if (!item) {
    return (
      <Card sx={{ maxWidth: 300, minWidth: 300 }}>
        <CardMedia sx={{ height: 200 }} image={`/static/images/items/placeholder.png`} title={`No item equipped`} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {slot}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No item equipped
          </Typography>
        </CardContent>
        <CardActions>
          {getSlotOptions(character, slot).length > 0 && (
            <Select onChange={(e) => handleEquipmentChange(e)} variant="standard">
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
    <Card sx={{ maxWidth: 300, minWidth: 300 }}>
      <CardMedia sx={{ height: 200 }} image={`/static/images/items/${item.itemTypeId}.png`} title={item.name} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {slot}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {item.itemTypeId}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Unequip</Button>
        {getSlotOptions(character, slot).length > 0 && (
          <Select value={character.equipment[slot]} onChange={(e) => handleEquipmentChange(e)} variant="standard">
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
  return (
    <Grid container spacing={2}>
      <EquipmentSlot character={character} setCharacter={setCharacter} slot="mainHand" itemId={character.equipment.mainHand} />
      <EquipmentSlot character={character} setCharacter={setCharacter} slot="offHand" itemId={character.equipment.offHand} />
      <EquipmentSlot character={character} setCharacter={setCharacter} slot="body" itemId={character.equipment.body} />
      <EquipmentSlot character={character} setCharacter={setCharacter} slot="head" itemId={character.equipment.head} />
    </Grid>
  );
};

export default CharacterViewEquipment;
