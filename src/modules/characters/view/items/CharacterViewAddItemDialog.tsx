import React, { useState, useEffect, FC, forwardRef, ReactElement, Ref } from 'react';
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
  Slide,
  Tooltip,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { AddItemDto } from '../../../api/character.dto';
import { fetchItems, Item } from '../../../api/items';
import { imageBaseUrl } from '../../../services/config';
import CharacterViewAddItemDialogForm from './CharacterViewAddItemDialogForm';

const categories = ['weapon', 'armor', 'shield', 'clothes', 'ammunition', 'tools', 'food'];
const armorSubcategories = ['head', 'body', 'arms', 'legs'];
const weaponSubcategories = [
  'melee-weapon@blade',
  'melee-weapon@greater-blade',
  'melee-weapon@chain',
  'melee-weapon@hafted',
  'melee-weapon@greater-hafted',
  'melee-weapon@pole-arm',
  'melee-weapon@exotic',
  'ranged-weapon@bow',
  'ranged-weapon@crossbow',
];

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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

  const IMAGE_SIZE = 80;

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
    setFormData(null);
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
    setFormData(null);
  }, [selectedCategory]);

  useEffect(() => {
    setIsValid(isFormValid());
  }, [formData]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      slots={{
        transition: Transition,
      }}
    >
      <DialogTitle>{t('Direct buy')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
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
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedCategory === category ? '2px solid' : 'none',
                        borderColor: 'success.main',
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
              <Box mb={1} display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
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
        <Button onClick={handleClose}>{t('Close')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!isValid}>
          {t('Buy')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterAddItemDialog;
