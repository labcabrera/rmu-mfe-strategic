import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { traitCategories } from '../../api/trait.dto';

const SelectTraitCategory: FC<{
  label: string;
  value: string | null;
  name: string;
  addAllOption?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}> = ({ label, value, name, onChange, addAllOption = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      select
      label={label}
      name={name}
      value={value === undefined || value === null ? '' : value}
      fullWidth
      onChange={onChange}
      error={required && !value}
    >
      {addAllOption ? (
        <MenuItem>
          <em>{t('all')}</em>
        </MenuItem>
      ) : null}
      {traitCategories.map((option, index) => (
        <MenuItem key={index} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectTraitCategory;
