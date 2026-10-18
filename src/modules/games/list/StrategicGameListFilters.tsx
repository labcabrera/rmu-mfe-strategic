/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, TextField } from '@mui/material';
import { FilterBar, fetchRealms, Realm, rsqlAnd, SearchField, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Filters of the strategic game list, reported as an RSQL query. */
export default function StrategicGameListFilters({ onChange }: { onChange: (rsql: string) => void }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [name, setName] = useState('');
  const [realmId, setRealmId] = useState('');
  const [realms, setRealms] = useState<Realm[]>([]);

  useEffect(() => {
    onChange(
      rsqlAnd([
        ['name=re=', name],
        ['realmId==', realmId],
      ])
    );
  }, [name, realmId]);

  useEffect(() => {
    fetchRealms('', 0, 100, auth)
      .then((response) => setRealms(response.content))
      .catch(notify.error);
  }, []);

  return (
    <FilterBar>
      <SearchField value={name} onChange={setName} />
      <Autocomplete
        options={realms}
        getOptionLabel={(option) => option?.name || ''}
        value={realms.find((option) => option.id === realmId) || null}
        onChange={(_, newValue) => setRealmId(newValue?.id || '')}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        fullWidth
        renderInput={(params) => <TextField {...params} label={t('realm')} />}
        noOptionsText={t('no-options')}
      />
    </FilterBar>
  );
}
