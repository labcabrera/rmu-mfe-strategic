/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectItemType = ({ value, onChange, items }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (items) {
      console.log('Items in SelectItemType:', items);
      const tmp = [];
      tmp.push(
        ...items.map((item) => ({
          key: item.id,
          value: t(item.id),
        }))
      );
      tmp.sort((a, b) => a.value.localeCompare(b.value));
      setOptions(tmp);
    }
  }, [items]);

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
      {options.map((option) => (
        <MenuItem key={option.key} value={option.key}>
          {option.value}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectItemType;
