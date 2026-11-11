/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined';
import {
  Character,
  Faction,
  FactionPicker,
  fetchCharacters,
  fetchFactions,
  fetchFullPage,
  fetchStrategicGames,
  FilterSchema,
  FilterSearchField,
  FilterSection,
  ListPage,
  RmuIconButton,
  StrategicGame,
  StrategicGamePicker,
  useApiNotify,
  useListFilters,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterCard from '../CharacterCard';

const nameOf = (list: { id: string; name: string }[], id: string) => list.find((each) => each.id === id)?.name ?? id;

/** Characters with a side filter panel (spec 046, decision 5): name, campaign and faction, kept in the URL. */
export default function CharacterListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useApiNotify();
  const [games, setGames] = useState<StrategicGame[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const schema: FilterSchema<Character> = {
    q: { kind: 'text', label: t('name'), toRsql: (value) => `name=re=${value}` },
    game: {
      kind: 'single',
      label: t('strategic-game'),
      format: (id) => nameOf(games, id),
      toRsql: (value) => `gameId==${value}`,
    },
    faction: {
      kind: 'single',
      label: t('faction'),
      format: (id) => nameOf(factions, id),
      toRsql: (value) => `factionId==${value}`,
    },
  };
  const filters = useListFilters(schema);
  const gameId = filters.get('game');
  const gameFactions = gameId ? factions.filter((faction) => faction.gameId === gameId) : factions;
  const query = usePagedQuery<Character>({
    fetcher: (q, page, size) => fetchCharacters(q, page, size, auth),
    rsql: filters.rsql,
    onError: notify.error,
  });

  useEffect(() => {
    fetchFullPage((rsql, page, size) => fetchStrategicGames(rsql, page, size, auth), '')
      .then((response) => setGames(response.content))
      .catch(notify.error);
    fetchFullPage((rsql, page, size) => fetchFactions(rsql, page, size, auth), '')
      .then((response) => setFactions(response.content))
      .catch(notify.error);
  }, []);

  const onGameChange = (id: string | null) => {
    filters.set('game', id);
    // The faction filter only offers the factions of the chosen game: drop a faction of another one.
    const factionId = filters.get('faction');
    if (id && factionId && factions.find((faction) => faction.id === factionId)?.gameId !== id)
      filters.set('faction', null);
  };

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters') },
      ]}
      query={query}
      actions={[
        <RmuIconButton
          key="treasure-tables"
          Icon={CasinoOutlinedIcon}
          tooltip={t('loot-tables-title')}
          ariaLabel={t('loot-tables-title')}
          onClick={() => navigate('/items/treasure-tables')}
        />,
      ]}
      filtersLayout="side"
      filterState={filters}
      filtersStorageKey="strategic.characters"
      filters={
        <>
          <FilterSection title={t('search')} collapsible={false}>
            <FilterSearchField filters={filters} filter="q" label={t('name')} />
          </FilterSection>
          <FilterSection title={t('strategic-game')}>
            <StrategicGamePicker
              games={games}
              value={gameId || null}
              onChange={onGameChange}
              allowAll
              variant="select"
            />
          </FilterSection>
          <FilterSection title={t('faction')}>
            <FactionPicker
              factions={gameFactions}
              value={filters.get('faction') || null}
              onChange={(id) => filters.set('faction', id)}
              allowAll
              variant="select"
            />
          </FilterSection>
        </>
      }
      collection={{ modes: ['cards'], storageKey: 'strategic.characters' }}
      renderItem={(character) => (
        <CharacterCard
          character={character}
          onClick={() => navigate(`/strategic/characters/view/${character.id}`, { state: { character } })}
        />
      )}
    />
  );
}
