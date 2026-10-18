import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Profession } from '@labcabrera-rmu/rmu-react-shared-lib';

const realms: string[] = ['channeling', 'essence', 'mentalism'];

const SelectRealmType: FC<{
  profession?: Profession;
  value: string | undefined;
  required?: boolean;
  onChange: (value: string) => void;
}> = ({ profession, value, onChange, required = true }) => {
  const { t } = useTranslation();
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
  const selectedRealmType = options.find((option) => option === value) ?? null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => t(option)}
      value={selectedRealmType}
      onChange={(_event, newValue) => onChange(newValue ?? '')}
      isOptionEqualToValue={(option, val) => option === val}
      readOnly={options.length === 1}
      noOptionsText={t('no-options')}
      fullWidth
      renderInput={(params) => <TextField {...params} label={t('realm')} error={error} required={required} />}
    />
  );
};

export default SelectRealmType;
