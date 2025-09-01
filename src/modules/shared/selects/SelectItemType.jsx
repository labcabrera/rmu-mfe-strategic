/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectItemType = ({ value, onChange, items }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      select
      label={t('item-type')}
      value={value === undefined || value === null || items.length === 0 ? '' : value}
      variant="standard"
      required
      fullWidth
      onChange={handleChange}
    >
      {items.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.id}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectItemType;
