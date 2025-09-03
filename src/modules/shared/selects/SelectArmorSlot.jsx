/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectArmorSlot = ({ value, onChange }) => {
  const { t } = useTranslation();
  const categories = ['body', 'head', 'arms', 'legs'];

  const handleFactionChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField select label={t('armor-slot')} value={value} variant="standard" required fullWidth onChange={handleFactionChange}>
      {categories.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectArmorSlot;
