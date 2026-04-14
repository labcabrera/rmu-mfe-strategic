import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { Profession, fetchProfessions } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const SelectProfession: React.FC<{
  value?: string | null;
  onChange: (value: string, profession: Profession | undefined) => void;
  required?: boolean;
}> = ({ value, onChange, required = true }) => {
  const { showError } = useError();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const isValueEmpty = value === undefined || value === null || value === '';
  const error = required && isValueEmpty;

  const selectedProfession = useMemo(() => professions.find((p) => p.id === value) ?? null, [professions, value]);

  useEffect(() => {
    fetchProfessions('', 0, 100)
      .then((data) => setProfessions(data.content))
      .catch((err) => showError(err));
  }, [showError]);

  return (
    <Autocomplete
      options={professions}
      getOptionLabel={(option) => (option ? t(option.id) || '' : '')}
      value={selectedProfession}
      onChange={(_event, newValue) => onChange(newValue?.id ?? '', newValue ?? undefined)}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      fullWidth
      size="small"
      renderInput={(params) => <TextField {...params} label={t('Profession')} error={error} required={required} />}
      noOptionsText={t('No options')}
    />
  );
};

export default SelectProfession;
