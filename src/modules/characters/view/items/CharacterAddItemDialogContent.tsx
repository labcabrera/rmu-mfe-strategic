import React, { useState, FC, SetStateAction, Dispatch } from 'react';
import { Box, CardMedia, Divider, Grid, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { AddItemDto } from '../../../api/character.dto';
import { Item, categories } from '../../../api/items';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';

const CharacterAddItemDialogSelect: FC<{
  subcategories: string[];
  selectedCategory: string | undefined;
  setSelectedCategory: Dispatch<SetStateAction<string | undefined>>;
  selectedSubcategory: string | undefined;
  setSelectedSubcategory: Dispatch<SetStateAction<string | undefined>>;
  items: Item[];
  onLoadItem: (item: Item) => void;
}> = ({
  subcategories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  items,
  onLoadItem,
}) => {
  const [formData, setFormData] = useState<AddItemDto>();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const IMAGE_SIZE = 80;

  const isFormValid = () => {
    if (!formData) return false;
    return !!formData.name;
  };

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
              {subcategories.map((subcategory, index) => (
                <Tooltip key={index} title={subcategory} arrow>
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
            {items.map((item, index) => (
              <Tooltip key={index} title={t(item.id)} arrow>
                <CardMedia
                  key={item.id}
                  component="img"
                  image={`${imageBaseUrl}images/items/${item.id}.png`}
                  alt={t(item.id)}
                  onClick={() => onLoadItem(item)}
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
      </Grid>
    </>
  );
};

export default CharacterAddItemDialogSelect;
