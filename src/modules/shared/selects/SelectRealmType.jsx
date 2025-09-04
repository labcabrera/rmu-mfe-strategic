/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectRealmType = ({ value, onChange }) => {
  const { t } = useTranslation();
  const categories = ['channeling', 'essence', 'mentalism'];

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField select label={t('realm-type')} value={value} variant="standard" required fullWidth onChange={handleChange}>
      {categories.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectRealmType;
