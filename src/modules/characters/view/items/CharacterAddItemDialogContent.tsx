import React, { useState, useEffect, FC, forwardRef, ReactElement, Ref } from 'react';
import { Box, CardMedia, Divider, Grid, Slide, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { AddItemDto } from '../../../api/character.dto';
import { fetchItems, Item, categories, armorSubcategories, weaponSubcategories } from '../../../api/items';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';
import CharacterAddItemDialogForm from './CharacterAddItemDialogForm';

const CharacterAddItemDialogContent: FC<{
  open: boolean;
  onClose: () => void;
  onItemAdded: (item: AddItemDto) => void;
}> = ({ open, onClose, onItemAdded }) => {
  const { showError } = useError();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<AddItemDto>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const IMAGE_SIZE = 80;

  const isFormValid = () => {
    if (!formData) return false;
    return !!formData.name;
  };

  const bindItems = (category: string | null, subcategory: string | null) => {
    let rsql = `category==${category}`;
    if (category === 'weapon' && subcategory) {
      rsql += `;weapon.skillId==${subcategory}`;
    } else if (category === 'armor' && selectedSubcategory) {
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

  useEffect(() => {
    if (selectedSubcategory) {
      bindItems(selectedCategory, selectedSubcategory);
    }
    setFormData(undefined);
  }, [selectedSubcategory]);

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'armor') {
        setSelectedSubcategory(null);
        setItems([]);
        setSubcategories(armorSubcategories);
      } else if (selectedCategory === 'weapon') {
        setSelectedSubcategory(null);
        setItems([]);
        setSubcategories(weaponSubcategories);
      } else {
        setSubcategories([]);
        bindItems(selectedCategory, null);
      }
    } else {
      setItems([]);
    }
    setSelectedSubcategory(null);
    setFormData(undefined);
  }, [selectedCategory]);

  useEffect(() => {
    setIsValid(isFormValid());
  }, [formData]);

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={0.2}>
            {categories.map((category) => (
              <>
                <Tooltip key={category} title={category} arrow>
                  <CardMedia
                    key={category}
                    component="img"
                    image={`${imageBaseUrl}images/items/category-${category}.png`}
                    alt={t(category)}
                    onClick={() => setSelectedCategory(category)}
                    sx={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      cursor: 'pointer',
                      border: selectedCategory === category ? '2px solid' : 'none',
                      borderColor: 'success.main',
                      objectFit: 'cover',
                      filter: itemFilter,
                    }}
                  />
                </Tooltip>
              </>
            ))}
          </Box>
        </Grid>
        <Divider />
        {subcategories && subcategories.length > 0 && (
          <Grid size={12}>
            <Box mb={1} display="flex" flexDirection="row" flexWrap="wrap" gap={0.2}>
              {subcategories.map((subcategory) => (
                <Tooltip key={subcategory} title={subcategory} arrow>
                  <CardMedia
                    key={subcategory}
                    component="img"
                    image={`${imageBaseUrl}images/items/category-${subcategory}.png`}
                    alt={t(subcategory)}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    sx={{
                      width: IMAGE_SIZE,
                      height: IMAGE_SIZE,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedSubcategory === subcategory ? '2px solid' : 'none',
                      borderColor: 'success.main',
                      filter: itemFilter,
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>
        )}
        <Divider />
        <Grid size={12}>
          <Box mb={1} display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
            {items.map((item) => (
              <Tooltip title={t(item.id)} arrow>
                <CardMedia
                  key={item.id}
                  component="img"
                  image={`${imageBaseUrl}images/items/${item.id}.png`}
                  alt={t(item.id)}
                  onClick={() => loadItem(item)}
                  sx={{
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedItem && selectedItem.id === item.id ? '2px solid' : 'none',
                    borderColor: 'success.main',
                    filter: itemFilter,
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Grid>
        <Grid size={12}>
          {formData && <CharacterAddItemDialogForm formData={formData} setFormData={setFormData} item={selectedItem} />}
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterAddItemDialogContent;
