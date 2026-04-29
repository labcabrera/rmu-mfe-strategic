import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const options = ['male', 'female', 'other'];

const SelectGender = ({ value, onChange, required = false }) => {
  return (
    <TextField
      select
      label={t('Gender')}
      value={value}
      required={required}
      size="small"
      fullWidth
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectGender;
