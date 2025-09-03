/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { addItem } from '../../api/characters';
import { fetchItems } from '../../api/items';
import SelectItemCategory from '../../shared/selects/SelectItemCategory';
import SelectItemType from '../../shared/selects/SelectItemType';

const CharacterViewAddItem = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  const [itemCategory, setItemCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: '', itemTypeId: '' });

  const handleItemCategoryChange = (category) => {
    console.log('Selected item category xxx:', category);
    setItemCategory(category);
  };

  const bindItems = (category) => {
    fetchItems(`category==${category}`, 0, 100)
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  };

  const handleAdd = () => {
    addItem(character.id, formData)
      .then((data) => setCharacter(data))
      .catch((err) => console.error(err));
  };

  const handleItemTypeChange = (itemId) => {
    console.log('Selected item type:', itemId);
    setFormData({ ...formData, itemTypeId: itemId });
  };

  useEffect(() => {
    if (itemCategory) {
      console.log('Selected item category use effect:', itemCategory);
      bindItems(itemCategory);
    }
  }, [itemCategory]);

  // useEffect(() => {
  //   fetchItems()
  //     .then((data) => setItems(data))
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('add-item')}
        </Typography>
      </Grid>
      <Grid size={3}>
        <SelectItemCategory value={itemCategory} onChange={(e) => handleItemCategoryChange(e)} />
      </Grid>
      <Grid size={3}>
        <SelectItemType items={items} value={formData.itemTypeId} onChange={(itemId) => handleItemTypeChange(itemId)} />
      </Grid>
      <Grid size={3}>
        <TextField
          label={t('item-name')}
          variant="standard"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" onClick={handleAdd}>
          Add Item
        </Button>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </Grid>
  );
};

export default CharacterViewAddItem;
