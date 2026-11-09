import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Grid, Stack, Tab, Tabs } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCharacter,
  fetchFullPage,
  fetchItems,
  fetchStrategicGame,
  fetchTreasureTables,
  isApiError,
  LayoutBase,
  LoadingState,
  TreasureRollPanel,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TreasureTableFocus } from '@labcabrera-rmu/rmu-react-shared-lib';
import { isGameMaster } from '../shared/permissions';
import TreasureTableGroupView, { TableFocusRequest } from './TreasureTableGroupView';
import { buildTreasureTabs, findTreasureTable } from './treasure-table-model';

/**
 * The random treasure tables of Treasure Law 7.1 next to the roll (workspace spec 094). `?characterId=` lets its game
 * master award the treasure to that character. The rows come from the API: they are not in this repository.
 */
export default function TreasureTablesPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const [params] = useSearchParams();
  const characterId = params.get('characterId');
  const [tabId, setTabId] = useState('codes');
  const [focus, setFocus] = useState<(TableFocusRequest & { groupId: string }) | null>(null);

  const tables = useQuery({
    queryKey: ['treasure-tables'],
    queryFn: () => fetchTreasureTables(auth),
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
  const items = useQuery({
    queryKey: ['treasure-tables-items'],
    queryFn: () => fetchFullPage((rsql, page, size) => fetchItems(rsql, page, size, auth), ''),
    enabled: !!tables.data,
    staleTime: 10 * 60 * 1000,
  });
  const character = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => fetchCharacter(characterId as string, auth),
    enabled: !!characterId,
  });
  const game = useQuery({
    queryKey: ['strategic-game', character.data?.gameId],
    queryFn: () => fetchStrategicGame(character.data?.gameId as string, auth),
    enabled: !!character.data?.gameId,
  });

  const tabs = useMemo(() => {
    if (!tables.data) return [];
    const names = new Map((items.data?.content ?? []).map((item) => [item.id, item.name]));
    return buildTreasureTabs(tables.data, t, (id) => names.get(id) ?? id);
  }, [tables.data, items.data, t]);

  const canAward = !!character.data && isGameMaster(auth, game.data);
  const tab = tabs.find((each) => each.id === tabId) ?? tabs[0];

  const onTableFocus = (die: TreasureTableFocus) => {
    const found = findTreasureTable(tabs, die.table);
    if (!found) return;
    setTabId(found.tab.id);
    setFocus({ ...die, groupId: found.group.id, tableIndex: found.tableIndex, nonce: Date.now() });
  };

  const forbidden = isApiError(tables.error) && tables.error.status === 403;
  const missing = isApiError(tables.error) && tables.error.status === 404;

  return (
    <LayoutBase
      plain
      allowSticky
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters'), link: '/strategic/characters' },
        ...(character.data
          ? [{ name: character.data.name, link: `/strategic/characters/view/${character.data.id}` }]
          : []),
        { name: t('loot-tables-title') },
      ]}
    >
      {tables.isLoading && <LoadingState />}
      {forbidden && <Alert severity="info">{t('loot-tables-no-access')}</Alert>}
      {missing && <Alert severity="warning">{t('loot-tables-missing')}</Alert>}
      {tables.error && !forbidden && !missing && (
        <Alert severity="error">{isApiError(tables.error) ? t(tables.error.messageKey) : String(tables.error)}</Alert>
      )}
      {tab && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 80 },
                maxHeight: { md: 'calc(100vh - 96px)' },
                overflowY: { md: 'auto' },
              }}
            >
              <TreasureRollPanel
                gameId={canAward ? character.data?.gameId : null}
                holder={canAward && characterId ? { kind: 'character', id: characterId } : null}
                readOnly={!canAward}
                onTableFocus={onTableFocus}
                hasTable={(table) => !!findTreasureTable(tabs, table)}
                onAwarded={() => notify.success(t('treasure-awarded', { faction: character.data?.name }))}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
            <Stack spacing={2}>
              <Tabs
                value={tab.id}
                onChange={(_, value: string) => setTabId(value)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label={t('loot-tables-title')}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {tabs.map((each) => (
                  <Tab key={each.id} value={each.id} label={each.label} />
                ))}
              </Tabs>
              {tab.groups.map((group) => (
                <TreasureTableGroupView
                  key={group.id}
                  group={group}
                  focus={focus?.groupId === group.id ? focus : null}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      )}
    </LayoutBase>
  );
}
