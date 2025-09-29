import React, { FC, ChangeEvent } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { t } from 'i18next';
import { Realm } from '../../api/realm.dto';

const SelectRealm: FC<{
  realms: Realm[];
  value: string | null | undefined;
  onChange: (realmId: string | null, realm: Realm | null) => void;
  required?: boolean;
}> = ({ realms, value, onChange, required = false }) => {
  const handleChange = (realmId: string) => {
    const selectedRealm = realms.find((realm) => realm.id === realmId);
    onChange(realmId, selectedRealm);
  };

  if (!realms) return <p>Loading...</p>;

  return (
    <Autocomplete
      disablePortal
      options={realms}
      getOptionLabel={(option) => option.name}
      onChange={(_, newValue) => handleChange(newValue?.id || '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('realm')}
          variant="standard"
          fullWidth
          error={required && !value}
          helperText={required && !value ? t('required-field') : ''}
        />
      )}
    />
  );
};

export default SelectRealm;
