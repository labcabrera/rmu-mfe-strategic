import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { AddItemDto, Character, CharacterItem } from '../../api/character.dto';
import { fetchItems, Item } from '../../api/items';
import TextCard from '../../shared/cards/TextCard';
import NumericInput from '../../shared/inputs/NumericInput';

const categories = ['weapon', 'armor', 'shield', 'clothes', 'ammunition', 'tools', 'food'];
const armorSubcategories = ['head', 'body', 'arms', 'legs'];

const CharacterAddItemDialog: FC<{
  open: boolean;
  character: Character;
  onClose: () => void;
  onItemAdded: (item: AddItemDto) => void;
}> = ({ open, character, onClose, onItemAdded }) => {
  const { showError } = useError();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<AddItemDto | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const handleClose = () => {
    setFormData(null);
    onClose();
  };

  const handleSave = async () => {
    onItemAdded(formData);
    handleClose();
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
    setFormData({
      itemTypeId: item.id,
      name: t(item.id),
      weight: item.info?.weight || null,
      weightPercent: item.info?.weightPercent || null,
      strength: item.info?.strength || null,
      amount: 1,
    } as AddItemDto);
  };

  const getItemDetail = (item: Item) => {
    return `Cost: ${item.info?.cost?.average || ''}`;
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
      <DialogContent sx={{ minHeight: '1000px' }}>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {categories.map((category) => (
                <TextCard
                  key={category}
                  value={t(category)}
                  subtitle=""
                  onClick={() => setSelectedCategory(category)}
                  image={`/static/images/items/category-${category}.png`}
                  maxWidth={190}
                  minWidth={190}
                  height={70}
                  imageSize={70}
                  grayscale={selectedCategory === category ? 0 : 1}
                  valueVariant="body1"
                />
              ))}
            </Box>
          </Grid>
          {subcategories && subcategories.length > 0 && (
            <Grid size={12}>
              <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
                {subcategories.map((subcategory) => (
                  <TextCard
                    key={subcategory}
                    value={t(subcategory)}
                    subtitle=""
                    onClick={() => setSelectedSubcategory(subcategory)}
                    image={`/static/images/generic/slot-${subcategory}.png`}
                    maxWidth={190}
                    minWidth={190}
                    height={70}
                    imageSize={70}
                    grayscale={selectedSubcategory === subcategory ? 0 : 1}
                    valueVariant="body1"
                  />
                ))}
              </Box>
            </Grid>
          )}
          <Divider />
          <Grid size={12}>
            <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
              {items.map((item) => (
                <TextCard
                  key={item.id}
                  value={t(item.id)}
                  subtitle={getItemDetail(item)}
                  onClick={() => loadItem(item)}
                  image={`/static/images/items/${item.id}.png`}
                  maxWidth={300}
                  minWidth={300}
                  height={70}
                  imageSize={70}
                  grayscale={0}
                  valueVariant="body1"
                />
              ))}
            </Box>
          </Grid>
          <Grid size={12}>{formData && <AddItemForm formData={formData} setFormData={setFormData} />}</Grid>
        </Grid>
        {/* <pre>{JSON.stringify(formData, null, 2)}</pre>
        <pre>{JSON.stringify(items, null, 2)}</pre> */}
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

const AddItemForm: FC<{
  formData: AddItemDto;
  setFormData: Dispatch<SetStateAction<AddItemDto | null>>;
}> = ({ formData, setFormData }) => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6">{t(formData.itemTypeId)}</Typography>
        </Grid>
        <Grid size={4}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label={t('item-name')}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('weight')}
                value={formData.weight}
                onChange={(value) => setFormData({ ...formData, weight: value })}
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('weight-percent')}
                value={formData.weightPercent}
                onChange={(value) => setFormData({ ...formData, weightPercent: value })}
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('strength')}
                value={formData.strength}
                onChange={(value) => setFormData({ ...formData, strength: value })}
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('amount')}
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={8}></Grid>
      </Grid>
    </>
  );
};

export default CharacterAddItemDialog;
