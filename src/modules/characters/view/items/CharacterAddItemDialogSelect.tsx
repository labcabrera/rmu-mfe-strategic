import React, { FC, SetStateAction, Dispatch, ReactNode } from 'react';
import { Box, CardMedia, Divider, Grid, Tooltip, Typography } from '@mui/material';
import { t } from 'i18next';
import { Item, categories } from '../../../api/items';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter, itemFilterDisabled } from '../../../services/display';

const imageSize = 80;

const CharacterAddItemDialogSelect: FC<{
  subcategories: string[];
  selectedCategory: string | undefined;
  setSelectedCategory: Dispatch<SetStateAction<string | undefined>>;
  selectedSubcategory: string | undefined;
  setSelectedSubcategory: Dispatch<SetStateAction<string | undefined>>;
  selectedItem: Item | undefined;
  items: Item[];
  onLoadItem: (item: Item) => void;
}> = ({
  subcategories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedItem,
  items,
  onLoadItem,
}) => {
  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CustomCategorySeparator text={`Category${selectedCategory ? `: ${t(selectedCategory)}` : ''}`} />

          <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.2}>
            {categories.map((category) => (
              <>
                <Tooltip key={category} title={t(category)} arrow>
                  <CardMedia
                    key={category}
                    component="img"
                    image={`${imageBaseUrl}images/items/category-${category}.png`}
                    alt={t(category)}
                    onClick={() => setSelectedCategory(category)}
                    sx={{
                      width: imageSize,
                      height: imageSize,
                      cursor: 'pointer',
                      borderColor: 'success.main',
                      objectFit: 'cover',
                      filter: !selectedCategory || selectedCategory === category ? itemFilter : itemFilterDisabled,
                    }}
                  />
                </Tooltip>
              </>
            ))}
          </Box>
        </Grid>

        {subcategories && subcategories.length > 0 && (
          <Grid size={12}>
            <CustomCategorySeparator text={`Category${selectedSubcategory ? `: ${t(selectedSubcategory)}` : ''}`} />

            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.2}>
              {subcategories.map((subcategory, index) => (
                <Tooltip key={index} title={t(subcategory)} arrow>
                  <CardMedia
                    key={subcategory}
                    component="img"
                    image={`${imageBaseUrl}images/items/category-${subcategory}.png`}
                    alt={t(subcategory)}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    sx={{
                      width: imageSize,
                      height: imageSize,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      borderColor: 'success.main',
                      filter:
                        !selectedSubcategory || selectedSubcategory === subcategory ? itemFilter : itemFilterDisabled,
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Grid>
        )}
        <Grid size={12}>
          <CustomCategorySeparator text={t('Items')} />
          <Box display="flex" flexDirection="row" flexWrap="wrap" gap={0.2}>
            {items.map((item, index) => (
              <Tooltip key={index} title={t(item.id)} arrow>
                <CardMedia
                  key={item.id}
                  component="img"
                  image={`${imageBaseUrl}images/items/${item.id}.png`}
                  alt={t(item.id)}
                  onClick={() => onLoadItem(item)}
                  sx={{
                    width: imageSize,
                    height: imageSize,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    borderColor: 'success.main',
                    filter: !selectedItem || selectedItem.id === item.id ? itemFilter : itemFilterDisabled,
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

const CustomCategorySeparator: FC<{ text: string; children?: ReactNode }> = ({ text, children }) => {
  return (
    <Box mb={1} mt={0}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" color="text.secondary">
          {text}
        </Typography>
      </Box>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  );
};

export default CharacterAddItemDialogSelect;
