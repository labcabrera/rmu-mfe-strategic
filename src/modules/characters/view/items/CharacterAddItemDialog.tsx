import React, { useState, useEffect, FC, forwardRef, ReactElement, Ref } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { AddItemDto } from '../../../api/character.dto';
import { fetchItems, Item, armorSubcategories, weaponSubcategories } from '../../../api/items';
import CharacterAddItemDialogContent from './CharacterAddItemDialogContent';

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
  const [formData, setFormData] = useState<AddItemDto>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleClose = () => {
    setFormData(undefined);
    onClose();
  };

  const handleSave = async () => {
    onItemAdded(formData!);
    setSelectedItem(null);
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
        <CharacterAddItemDialogContent open={open} onClose={onClose} onItemAdded={onItemAdded} />
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
