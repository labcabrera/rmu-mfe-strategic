import React, { useState, useEffect, ChangeEvent } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchProfessions, Profession } from '../../api/professions';

const SelectProfession: React.FC<{
  value?: string | null;
  onChange: (value: string, profession: Profession | undefined) => void;
  required?: boolean;
}> = ({ value, onChange, required = true }) => {
  const { showError } = useError();
  const [professions, setProfessions] = useState<Profession[]>([]);

  const handleProfessionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    const profession = professions.find((e) => e.id === selectedValue);
    onChange(selectedValue, profession);
  };

  useEffect(() => {
    fetchProfessions()
      .then((data) => setProfessions(data))
      .catch((err) => showError(err));
  }, [showError]);

  const isValueEmpty = value === undefined || value === null || value === '';
  const hasError = required && isValueEmpty;

  return (
    <TextField
      select
      label={t('profession')}
      value={professions.length === 0 || isValueEmpty ? '' : value}
      variant="standard"
      onChange={handleProfessionChange}
      fullWidth
      error={hasError}
    >
      {professions.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {t(option.id)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectProfession;
