/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectItemCategory = ({ value, onChange }) => {
  const { t } = useTranslation();
  const categories = ['weapon', 'armor', 'shield', 'clothes'];

  const handleFactionChange = (e) => {
    console.log('Selected item category:', e.target.value);
    onChange(e.target.value);
  };

  return (
    <TextField select label={t('item-category')} value={value} variant="standard" required fullWidth onChange={handleFactionChange}>
      {categories.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectItemCategory;
