import React, { useState, useEffect, FC, forwardRef, ReactElement, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { AddItemDto, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import { fetchItems, Item, armorSubcategories, weaponSubcategories } from '../../../api/items';
import CharacterAddItemDialogForm from './CharacterAddItemDialogForm';
import CharacterAddItemDialogSelect from './CharacterAddItemDialogSelect';

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
  const { t } = useTranslation();
  const { showError } = useError();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>();
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<AddItemDto>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item>();

  const handleClose = () => {
    setFormData(undefined);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedItem(undefined);
    onClose();
  };

  const handleSave = async () => {
    onItemAdded(formData!);
    setSelectedItem(undefined);
    setFormData(undefined);
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
      length: item.info.length,
      fumble: item.weapon?.fumble || null,
      amount: 1,
    } as AddItemDto);
  };

  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      bindItems(selectedCategory, selectedSubcategory);
      setSelectedItem(undefined);
    }
    setFormData(undefined);
  }, [selectedSubcategory]);

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'armor') {
        setSelectedSubcategory(undefined);
        setItems([]);
        setSubcategories(armorSubcategories);
      } else if (selectedCategory === 'weapon') {
        setSelectedSubcategory(undefined);
        setItems([]);
        setSubcategories(weaponSubcategories);
      } else {
        setSubcategories([]);
        bindItems(selectedCategory, null);
      }
    } else {
      setItems([]);
    }
    setSelectedSubcategory(undefined);
    setSelectedItem(undefined);
    setFormData(undefined);
  }, [selectedCategory]);

  useEffect(() => {
    setIsValid(isFormValid());
  }, [formData]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      slots={{
        transition: Transition,
      }}
      sx={{ minHeight: '600px' }}
    >
      <DialogTitle>{t('Direct buy')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          <Grid size={6}>
            <CharacterAddItemDialogSelect
              subcategories={subcategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              selectedItem={selectedItem}
              items={items}
              onLoadItem={loadItem}
            />
          </Grid>
          <Grid size={6}>
            {formData && (
              <CharacterAddItemDialogForm formData={formData} setFormData={setFormData} item={selectedItem} />
            )}
          </Grid>
          <Grid size={12}>
            <TechnicalInfo>
              <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
              <pre>Item: {JSON.stringify(selectedItem, null, 2)}</pre>
            </TechnicalInfo>
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
