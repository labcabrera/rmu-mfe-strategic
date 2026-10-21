/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, TextField } from '@mui/material';
import {
  Faction,
  FilterBar,
  fetchFactions,
  fetchStrategicGames,
  rsqlAnd,
  SearchField,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Filters of the character list, reported as an RSQL query. */
export default function CharacterListFilters({ onChange }: { onChange: (rsql: string) => void }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [factionId, setFactionId] = useState('');
  const [games, setGames] = useState<StrategicGame[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const gameFactions = gameId ? factions.filter((faction) => faction.gameId === gameId) : factions;

  useEffect(() => {
    onChange(
      rsqlAnd([
        ['name=re=', name],
        ['gameId==', gameId],
        ['factionId==', factionId],
      ])
    );
  }, [name, gameId, factionId]);

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setGames(response.content))
      .catch(notify.error);
    fetchFactions('', 0, 100, auth)
      .then((response) => setFactions(response.content))
      .catch(notify.error);
  }, []);

  return (
    <FilterBar activeCount={[gameId, factionId].filter(Boolean).length}>
      <SearchField value={name} onChange={setName} />
      <Autocomplete
        options={games}
        getOptionLabel={(option) => option?.name || ''}
        value={games.find((option) => option.id === gameId) || null}
        onChange={(_, newValue) => {
          const nextGameId = newValue?.id || '';
          setGameId(nextGameId);
          // The faction filter only offers the factions of the chosen game: drop a faction of another one.
          if (nextGameId && factions.find((faction) => faction.id === factionId)?.gameId !== nextGameId)
            setFactionId('');
        }}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        fullWidth
        renderInput={(params) => <TextField {...params} label={t('strategic-game')} />}
        noOptionsText={t('no-options')}
      />
      <Autocomplete
        options={gameFactions}
        getOptionLabel={(option) => option?.name || ''}
        value={gameFactions.find((option) => option.id === factionId) || null}
        onChange={(_, newValue) => setFactionId(newValue?.id || '')}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        fullWidth
        renderInput={(params) => <TextField {...params} label={t('faction')} />}
        noOptionsText={t('no-options')}
      />
    </FilterBar>
  );
}
