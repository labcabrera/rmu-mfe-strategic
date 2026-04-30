import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { AddItemDto, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ItemSelector } from '../../../items/ItemSelector';

const CharacterAddItemDialog: FC<{
  open: boolean;
  onClose: () => void;
  onItemAdded: (item: AddItemDto) => void;
}> = ({ open, onClose, onItemAdded }) => {
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState<AddItemDto>({} as AddItemDto);

  const handleClose = () => {
    setFormData({} as AddItemDto);
    onClose();
  };

  const handleSave = async () => {
    onItemAdded(formData!);
    setFormData({} as AddItemDto);
  };

  const isFormValid = () => {
    if (!formData) return false;
    return !!formData.name;
  };

  useEffect(() => {
    setIsValid(isFormValid());
  }, [formData]);

  const buttons = [
    <>
      <Button onClick={handleClose}>{t('close')}</Button>
      <Button onClick={handleSave} variant="contained" color="success" disabled={!isValid}>
        {t('buy')}
      </Button>
    </>,
  ];

  return (
    <RmuDialog open={open} maxWidth="xl" title={t('buy')} buttons={buttons}>
      <ItemSelector formData={formData} setFormData={setFormData} />
    </RmuDialog>
  );
};

export default CharacterAddItemDialog;
