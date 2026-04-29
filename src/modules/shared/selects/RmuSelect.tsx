import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

const RmuSelect: FC<{
  value: string;
  label: string;
  options: string[];
  onChange: (value: string) => void;
}> = ({ value, label, options, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      label={label}
      value={value === undefined || value === null ? '' : value}
      onChange={handleChange}
      fullWidth
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default RmuSelect;
