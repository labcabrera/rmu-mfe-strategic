import React, { ChangeEvent, FC } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { Profession } from '../../api/professions';

const realms: string[] = ['channeling', 'essence', 'mentalism'];

const SelectRealmType: FC<{
  profession?: Profession;
  value: string | undefined;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}> = ({ profession, value, onChange, required = true }) => {
  const error = required && (!value || value.trim() === '');

  const getOptions = () => {
    if (profession && profession.availableRealmTypes.length > 0) {
      return profession.availableRealmTypes;
    } else if (profession && profession.fixedRealmTypes.length > 0) {
      return profession.fixedRealmTypes;
    }
    return realms;
  };

  const options = getOptions();

  return (
    <TextField
      select
      label={t('Realm type')}
      value={value || ''}
      size="small"
      fullWidth
      onChange={onChange}
      disabled={options.length === 1}
      error={error}
    >
      {options.map((c) => (
        <MenuItem key={c} value={c}>
          {t(c)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectRealmType;
