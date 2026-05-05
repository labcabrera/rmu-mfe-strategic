import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { Grid, CircularProgress, Autocomplete, TextField } from '@mui/material';
import {
  LayoutBase,
  RmuTextCard,
  Page,
  Character,
  fetchCharacters,
  RmuPagination,
  ClearableTextField,
  StrategicGame,
  fetchStrategicGames,
  TechnicalInfo,
  Faction,
  fetchFactions,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeCard } from '../../services/display';

export default function CharacterList() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();

  const [rsql, setRsql] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [pageData, setPageData] = useState<Page<Character>>();
  const [searchFormData, setSearchFormData] = useState<any>({ name: '', gameId: '' });

  const [games, setGames] = useState<StrategicGame[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);

  const append = (rsql: string, predicate: string) => {
    if (rsql === '') return predicate;
    return `${rsql};${predicate}`;
  };

  useEffect(() => {
    fetchCharacters(rsql, page, pageSize, auth)
      .then((data) => setPageData(data))
      .catch((err) => showError(err.message));
  }, [rsql, page, pageSize]);

  useEffect(() => {
    let rsql = '';
    if (searchFormData.name) rsql = append(rsql, `name=re=${searchFormData.name}`);
    if (searchFormData.gameId) rsql = append(rsql, `gameId==${searchFormData.gameId}`);
    if (searchFormData.factionId) rsql = append(rsql, `factionId==${searchFormData.factionId}`);
    setRsql(rsql);
  }, [searchFormData]);

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setGames(response.content))
      .catch((err) => showError(err.message));
    fetchFactions('', 0, 100, auth)
      .then((response) => setFactions(response.content))
      .catch((err) => showError(err.message));
  }, []);

  return (
    <LayoutBase breadcrumbs={[{ name: t('home'), link: '/' }, { name: t('characters') }]} actions={[]}>
      <Grid container spacing={1}>
        <Grid size={gridSizeCard}>
          <ClearableTextField label={t('name')} onChange={(e) => setSearchFormData({ ...searchFormData, name: e })} />
        </Grid>
        <Grid size={gridSizeCard}>
          <Autocomplete
            options={games}
            getOptionLabel={(option) => option?.name || ''}
            value={games.find((option) => option.id === searchFormData.gameId) || null}
            onChange={(_, newValue) => setSearchFormData({ ...searchFormData, gameId: newValue?.id || '' })}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            fullWidth
            size="small"
            renderInput={(params) => <TextField {...params} label={t('strategic-game')} />}
            noOptionsText={t('no-options')}
          />
        </Grid>
        <Grid size={gridSizeCard}>
          {' '}
          <Autocomplete
            options={factions}
            getOptionLabel={(option) => option?.name || ''}
            value={factions.find((option) => option.id === searchFormData.factionId) || null}
            onChange={(_, newValue) => setSearchFormData({ ...searchFormData, factionId: newValue?.id || '' })}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            fullWidth
            size="small"
            renderInput={(params) => <TextField {...params} label={t('faction')} />}
            noOptionsText={t('no-options')}
          />
        </Grid>
      </Grid>

      {!pageData ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={1} sx={{ mt: 2 }}>
            {pageData.content?.map((c, index) => (
              <Grid size={gridSizeCard} key={index}>
                <RmuTextCard
                  value={c.name}
                  subtitle={c.info.race.name}
                  image={c.imageUrl || ''}
                  onClick={() => navigate(`/strategic/characters/view/${c.id}`, { state: c })}
                />
              </Grid>
            ))}
          </Grid>
          {pageData.content.length === 0} {<p>{t('no-data-found')}</p>}
          <RmuPagination
            page={page}
            pageSize={pageSize}
            totalPages={pageData.pagination.totalPages}
            setPage={setPage}
            setPageSize={setPageSize}
          />
          <TechnicalInfo>
            <pre>{JSON.stringify(searchFormData, null, 2)}</pre>
          </TechnicalInfo>
        </>
      )}
    </LayoutBase>
  );
}
