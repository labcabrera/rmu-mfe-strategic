import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

type RealmType = 'channeling' | 'essence' | 'mentalism';

const SelectRealmType: FC<{
  value?: RealmType | string;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}> = ({ value, onChange, required = true }) => {
  const { t } = useTranslation();
  const categories: RealmType[] = ['channeling', 'essence', 'mentalism'];
  const error = required && (!value || value.trim() === '');

  return (
    <TextField
      select
      label={t('realm-type')}
      value={value || ''}
      size="small"
      fullWidth
      onChange={onChange}
      error={error}
    >
      {categories.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectRealmType;
