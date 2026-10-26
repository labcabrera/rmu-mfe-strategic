import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { Profession } from '@labcabrera-rmu/rmu-react-shared-lib';

const realms: string[] = ['channeling', 'essence', 'mentalism'];

/**
 * Realms of a character (spec 029): the fixed realms of a spellcaster profession (two for a hybrid), read only, or one
 * of the available realms of an arms profession.
 */
const SelectRealmType: FC<{
  profession?: Profession;
  value: string[];
  required?: boolean;
  onChange: (value: string[]) => void;
}> = ({ profession, value, onChange, required = true }) => {
  const { t } = useTranslation();
  const error = required && value.length === 0;
  const fixed = profession?.fixedRealmTypes ?? [];

  if (fixed.length > 0) {
    return (
      <Autocomplete
        multiple
        options={fixed}
        value={fixed}
        getOptionLabel={(option) => t(option)}
        readOnly
        fullWidth
        renderValue={(selected) => selected.map((realm) => <Chip key={realm} label={t(realm)} size="small" />)}
        renderInput={(params) => <TextField {...params} label={t('realm')} required={required} />}
      />
    );
  }

  const options = profession && profession.availableRealmTypes.length > 0 ? profession.availableRealmTypes : realms;
  const selected = options.find((option) => option === value[0]) ?? null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => t(option)}
      value={selected}
      onChange={(_event, newValue) => onChange(newValue ? [newValue] : [])}
      isOptionEqualToValue={(option, val) => option === val}
      readOnly={options.length === 1}
      noOptionsText={t('no-options')}
      fullWidth
      renderInput={(params) => <TextField {...params} label={t('realm')} error={error} required={required} />}
    />
  );
};

export default SelectRealmType;
