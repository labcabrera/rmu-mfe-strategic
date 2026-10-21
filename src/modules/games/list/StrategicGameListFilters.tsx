/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { FilterBar, Realm, rsqlAnd, SearchField } from '@labcabrera-rmu/rmu-react-shared-lib';

/** Statuses of a campaign (rmu-api-strategic GameStatus). */
export const GAME_STATUSES = ['open', 'closed'] as const;

/** Filters of the strategic game list, reported as an RSQL query. The realms come from the page. */
export default function StrategicGameListFilters({
  realms,
  onChange,
}: {
  realms: Realm[];
  onChange: (rsql: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [realmId, setRealmId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    onChange(
      rsqlAnd([
        ['name=re=', name],
        ['realmId==', realmId],
        ['status==', status],
      ])
    );
  }, [name, realmId, status]);

  // Filters behind the "Filters" button on phones (the name search is always visible).
  const activeCount = [realmId, status].filter(Boolean).length;

  return (
    <FilterBar activeCount={activeCount}>
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
      <TextField select label={t('status')} value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
        <MenuItem value="">{t('all')}</MenuItem>
        {GAME_STATUSES.map((option) => (
          <MenuItem key={option} value={option}>
            {t(option)}
          </MenuItem>
        ))}
      </TextField>
    </FilterBar>
  );
}
