import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Grid } from '@mui/material';
import { AddItemDto, fetchItems, Item, RmuDialog, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import { armorSubcategories, weaponSubcategories } from '../../../api/items';
import CharacterAddItemDialogForm from './CharacterAddItemDialogForm';
import CharacterAddItemDialogSelect from './CharacterAddItemDialogSelect';

const CharacterAddItemDialog: FC<{
  open: boolean;
  onClose: () => void;
  onItemAdded: (item: AddItemDto) => void;
}> = ({ open, onClose, onItemAdded }) => {
  const auth = useAuth();
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
    fetchItems(rsql, 0, 100, auth)
      .then((data) => setItems(data.content))
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

  const buttons = [
    <>
      <Button onClick={handleClose}>{t('close')}</Button>
      <Button onClick={handleSave} variant="contained" disabled={!isValid}>
        {t('buy')}
      </Button>
    </>,
  ];

  return (
    <RmuDialog open={open} maxWidth="xl" title={t('buy')} buttons={buttons}>
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
          {formData && <CharacterAddItemDialogForm formData={formData} setFormData={setFormData} item={selectedItem} />}
        </Grid>
        <Grid size={12}>
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
            <pre>Item: {JSON.stringify(selectedItem, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </RmuDialog>
  );
};

export default CharacterAddItemDialog;
