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
  const isValueEmpty = value === undefined || value === null || value === '';
  const error = required && isValueEmpty;

  const handleProfessionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    const profession = professions.find((e) => e.id === selectedValue);
    onChange(selectedValue, profession);
  };

  useEffect(() => {
    fetchProfessions('', 0, 100)
      .then((data) => setProfessions(data.content))
      .catch((err) => showError(err));
  }, [showError]);

  return (
    <TextField
      select
      label={t('Profession')}
      value={professions.length === 0 || isValueEmpty ? '' : value}
      onChange={handleProfessionChange}
      fullWidth
      error={error}
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
