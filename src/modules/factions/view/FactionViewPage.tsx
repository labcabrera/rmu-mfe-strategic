/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import {
  AddButton,
  Character,
  CollectionModeSwitch,
  CollectionMode,
  deleteFaction,
  DetailPage,
  Faction,
  fetchCharacters,
  fetchFaction,
  fetchStrategicGame,
  gridSizeCard,
  RmuTextCard,
  Section,
  StrategicGame,
  useCollectionMode,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import FactionViewAttributes from './FactionViewAttributes';
import FactionViewCharactersTable from './FactionViewCharacterTable';
import FactionViewCharacters from './FactionViewCharacters';
import FactionViewResume from './FactionViewResume';

const CHARACTER_VIEW_MODES: CollectionMode[] = ['cards', 'table'];

export default function FactionViewPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const notify = useNotify();
  const { factionId } = useParams<{ factionId: string }>();
  const state = useEntity<Faction>(factionId, (id) => fetchFaction(id, auth), {
    initial: location.state?.faction,
    onError: notify.error,
  });
  const faction = state.entity;
  const [game, setGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterViewMode, setCharacterViewMode] = useCollectionMode(
    'strategic.faction-characters',
    CHARACTER_VIEW_MODES
  );

  useEffect(() => {
    if (!faction) return;
    fetchStrategicGame(faction.gameId, auth)
      .then((data: StrategicGame) => setGame(data))
      .catch(notify.error);
    fetchCharacters(`faction.id==${faction.id}`, 0, 100, auth)
      .then((data) => setCharacters(data.content))
      .catch(notify.error);
  }, [faction]);

  const onDelete = (entity: Faction) =>
    deleteFaction(entity.id, auth)
      .then(() => navigate(`/strategic/games/view/${entity.gameId}`, { replace: true }))
      .catch(notify.error);

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('factions'), link: '/strategic/factions' },
        { name: t('view') },
      ]}
      entity={state}
      summaryTitle={(entity) => t(entity.name)}
      onEdit={(entity) =>
        navigate(`/strategic/factions/edit/${entity.id}`, { state: { faction: entity, strategicGame: game } })
      }
      onDelete={onDelete}
      leftPanel={(entity) => <FactionViewResume faction={entity} setFaction={state.setEntity} game={game} />}
    >
      {(entity) => (
        <Grid container spacing={1}>
          <Grid size={12}>
            <Section title={t('strategic-game')} elevation={0}>
              <Grid container spacing={1}>
                <Grid size={gridSizeCard}>
                  <RmuTextCard
                    value={game?.name || ''}
                    subtitle={t('strategic-game')}
                    image={game?.imageUrl || ''}
                    onClick={() =>
                      navigate(`/strategic/games/view/${entity.gameId}`, { state: { strategicGame: game } })
                    }
                  />
                </Grid>
              </Grid>
            </Section>
          </Grid>
          <Grid size={12}>
            <Section title={t('information')} elevation={0}>
              <FactionViewAttributes faction={entity} characters={characters} />
            </Section>
          </Grid>
          <Grid size={12}>
            <Section
              title={t('characters')}
              elevation={0}
              actions={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AddButton
                    onClick={() =>
                      navigate(`/strategic/characters/create?gameId=${entity.gameId}&factionId=${entity.id}`, {
                        state: { faction: entity },
                      })
                    }
                  />
                  <CollectionModeSwitch
                    modes={CHARACTER_VIEW_MODES}
                    value={characterViewMode}
                    onChange={setCharacterViewMode}
                  />
                </Box>
              }
            >
              {characterViewMode === 'table' ? (
                <FactionViewCharactersTable characters={characters} />
              ) : (
                <FactionViewCharacters characters={characters} />
              )}
            </Section>
          </Grid>
        </Grid>
      )}
    </DetailPage>
  );
}
