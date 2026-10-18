/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, TextField } from '@mui/material';
import {
  FilterBar,
  fetchStrategicGames,
  rsqlAnd,
  SearchField,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Filters of the faction list, reported as an RSQL query. */
export default function FactionListFilters({ onChange }: { onChange: (rsql: string) => void }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [games, setGames] = useState<StrategicGame[]>([]);

  useEffect(() => {
    onChange(
      rsqlAnd([
        ['name=re=', name],
        ['gameId==', gameId],
      ])
    );
  }, [name, gameId]);

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setGames(response.content))
      .catch(notify.error);
  }, []);

  return (
    <FilterBar>
      <SearchField value={name} onChange={setName} />
      <Autocomplete
        options={games}
        getOptionLabel={(option) => option?.name || ''}
        value={games.find((option) => option.id === gameId) || null}
        onChange={(_, newValue) => setGameId(newValue?.id || '')}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        fullWidth
        renderInput={(params) => <TextField {...params} label={t('strategic-game')} />}
        noOptionsText={t('no-options')}
      />
    </FilterBar>
  );
}
