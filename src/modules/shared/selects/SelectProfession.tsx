import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { TextField, Autocomplete } from '@mui/material';
import { fetchProfessions, Profession, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

const SelectProfession: React.FC<{
  value?: string | null;
  onChange: (value: string, profession: Profession | undefined) => void;
  required?: boolean;
}> = ({ value, onChange, required = true }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const isValueEmpty = value === undefined || value === null || value === '';
  const error = required && isValueEmpty;

  const selectedProfession = useMemo(() => professions.find((p) => p.id === value) ?? null, [professions, value]);

  useEffect(() => {
    fetchProfessions('', 0, 100, auth)
      .then((data) => setProfessions(data.content))
      .catch((err) => notify.error(err?.message || String(err)));
  }, []);

  return (
    <Autocomplete
      options={professions}
      getOptionLabel={(option) => (option ? t(option.id) || '' : '')}
      value={selectedProfession}
      onChange={(_event, newValue) => onChange(newValue?.id ?? '', newValue ?? undefined)}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      fullWidth
      renderInput={(params) => <TextField {...params} label={t('profession')} error={error} required={required} />}
      noOptionsText={t('no-options')}
    />
  );
};

export default SelectProfession;
