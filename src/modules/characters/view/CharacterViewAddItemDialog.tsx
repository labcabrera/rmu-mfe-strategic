import React, { useState, useEffect, FC } from 'react';
import {
  Box,
  Button,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Tooltip,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { AddItemDto } from '../../api/character.dto';
import { fetchItems, Item } from '../../api/items';
// TextCard replaced by CardMedia instances
import CharacterViewAddItemDialogForm from './CharacterViewAddItemDialogForm';

const categories = ['weapon', 'armor', 'shield', 'clothes', 'ammunition', 'tools', 'food'];
const armorSubcategories = ['head', 'body', 'arms', 'legs'];

const CharacterAddItemDialog: FC<{
  open: boolean;
  onClose: () => void;
  onItemAdded: (item: AddItemDto) => void;
}> = ({ open, onClose, onItemAdded }) => {
  const { showError } = useError();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<AddItemDto | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const IMAGE_SIZE = 100;

  const handleClose = () => {
    setFormData(null);
    onClose();
  };

  const handleSave = async () => {
    onItemAdded(formData);
    setSelectedItem(null);
    setFormData(null);
  };

  const isFormValid = () => {
    if (!formData) return false;
    return !!formData.name;
  };

  const bindItems = (category: string | null, subcategory: string | null) => {
    let rsql = `category==${category}`;
    if (category === 'armor' && selectedSubcategory) {
      rsql += `;armor.slot==${selectedSubcategory}`;
    }
    fetchItems(rsql, 0, 100)
      .then((data) => setItems(data))
      .catch((err) => showError(err.message));
  };

  const loadItem = (item: Item) => {
    setSelectedItem(item);
    setFormData({
      itemTypeId: item.id,
      name: t(item.id),
      weight: item.info?.weight || null,
      weightPercent: item.info?.weightPercent || null,
      strength: item.info?.strength || null,
      cost: item.info?.cost?.average || null,
      amount: 1,
    } as AddItemDto);
  };

  const getItemDetail = (item: Item) => {
    return `${item.info?.cost?.average || '0'}g`;
  };

  useEffect(() => {
    if (selectedSubcategory) {
      bindItems(selectedCategory, selectedSubcategory);
    }
    setFormData(null);
  }, [selectedSubcategory]);

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'armor') {
        setSelectedSubcategory(null);
        setItems([]);
        setSubcategories(armorSubcategories);
      } else {
        setSubcategories([]);
        bindItems(selectedCategory, null);
      }
    } else {
      setItems([]);
    }
    setSelectedSubcategory(null);
    setFormData(null);
  }, [selectedCategory]);

  useEffect(() => {
    setIsValid(isFormValid());
  }, [formData]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>{t('add-item')}</DialogTitle>
      <DialogContent sx={{ minHeight: '800px' }}>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {categories.map((category) => (
                <>
                  <CardMedia
                    key={category}
                    component="img"
                    image={`/static/images/items/category-${category}.png`}
                    alt={t(category)}
                    onClick={() => setSelectedCategory(category)}
                    sx={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedCategory === category ? '2px solid' : 'none',
                      borderColor: 'success.main',
                    }}
                  />
                </>
              ))}
            </Box>
          </Grid>
          <Divider />
          {subcategories && subcategories.length > 0 && (
            <Grid size={12}>
              <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
                {subcategories.map((subcategory) => (
                  <CardMedia
                    key={subcategory}
                    component="img"
                    image={`/static/images/generic/slot-${subcategory}.png`}
                    alt={t(subcategory)}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    sx={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedSubcategory === subcategory ? '2px solid' : 'none',
                      borderColor: 'success.main',
                    }}
                  />
                ))}
              </Box>
            </Grid>
          )}
          <Divider />
          <Grid size={12}>
            <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {items.map((item) => (
                <Tooltip title={t(item.id)} arrow>
                  <CardMedia
                    key={item.id}
                    component="img"
                    image={`/static/images/items/${item.id}.png`}
                    alt={t(item.id)}
                    onClick={() => loadItem(item)}
                    sx={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedItem && selectedItem.id === item.id ? '2px solid' : 'none',
                      borderColor: 'success.main',
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>
          <Grid size={12}>
            {formData && (
              <CharacterViewAddItemDialogForm formData={formData} setFormData={setFormData} item={selectedItem} />
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!isValid}>
          {t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterAddItemDialog;
