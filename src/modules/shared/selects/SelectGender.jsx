/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectGender = ({ value, onChange, required = false }) => {
  const { t } = useTranslation();
  const categories = ['male', 'female', 'other'];

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      select
      label={t('gender')}
      value={value}
      variant="standard"
      required={required}
      fullWidth
      onChange={handleChange}
    >
      {categories.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectGender;
