import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';

const SelectGender = ({ value, onChange, required = false }) => {
  const categories = ['male', 'female', 'other'];

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField select label={t('Gender')} value={value} required={required} fullWidth onChange={handleChange}>
      {categories.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectGender;
