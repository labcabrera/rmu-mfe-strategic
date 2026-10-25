/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  AddButton,
  Character,
  CollectionMode,
  CollectionModeSwitch,
  deleteFaction,
  DetailPage,
  Faction,
  fetchCharacters,
  fetchFaction,
  fetchStrategicGame,
  ImageSelectorDialog,
  LoadingState,
  MoneyDisplay,
  Panel,
  StatPill,
  StrategicGame,
  updateFaction,
  useCollectionMode,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DEFAULT_FACTION_IMAGE_PATH } from '../../services/image-service';
import { Bento, span } from '../../shared/layout/Bento';
import FactionViewArmory from './FactionViewArmory';
import FactionViewCharactersTable from './FactionViewCharacterTable';
import FactionViewCharacters from './FactionViewCharacters';

const CHARACTER_VIEW_MODES: CollectionMode[] = ['cards', 'table'];

/**
 * Faction view, with the layout of the character view (spec 017): a header with the image, the campaign and the
 * key numbers (gold, experience, levels and characters), the description, and the characters as cards or a table.
 */
export default function FactionViewPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const notify = useNotify();
  const { factionId } = useParams<{ factionId: string }>();
  const state = useEntity<Faction>(factionId, (id) => fetchFaction(id, auth), {
    initial: location.state?.faction,
    onError: notify.error,
  });
  const faction = state.entity;
  const [game, setGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [characterViewMode, setCharacterViewMode] = useCollectionMode(
    'strategic.faction-characters',
    CHARACTER_VIEW_MODES
  );
  const numberFormat = useMemo(() => new Intl.NumberFormat(i18n.language), [i18n.language]);

  useEffect(() => {
    if (!faction) return;
    fetchStrategicGame(faction.gameId, auth)
      .then((data: StrategicGame) => setGame(data))
      .catch(notify.error);
    fetchCharacters(`faction.id==${faction.id}`, 0, 100, auth)
      .then((data) => setCharacters(data.content))
      .catch(notify.error);
  }, [faction?.id]);

  const onDelete = (entity: Faction) =>
    deleteFaction(entity.id, auth)
      .then(() => navigate(`/strategic/games/view/${entity.gameId}`, { replace: true }))
      .catch(notify.error);

  const onImageSelected = (entity: Faction, imageUrl: string) =>
    updateFaction(entity.id, { imageUrl }, auth)
      .then(() => state.setEntity({ ...entity, imageUrl }))
      .catch(notify.error);

  const totalLevels = characters?.reduce((sum, c) => sum + (c.experience?.availableLevel ?? 0), 0);

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('factions'), link: '/strategic/factions' },
        { name: faction?.name ?? t('view') },
      ]}
      entity={state}
      onEdit={(entity) =>
        navigate(`/strategic/factions/edit/${entity.id}`, { state: { faction: entity, strategicGame: game } })
      }
      onDelete={onDelete}
      hero={(entity) => ({
        title: entity.name,
        overline: t('faction'),
        image: entity.imageUrl || DEFAULT_FACTION_IMAGE_PATH,
        onImageClick: () => setImageDialogOpen(true),
        imageActionLabel: t('change-image'),
        chips: game
          ? [
              <Chip
                key="game"
                label={game.name}
                variant="outlined"
                onClick={() => navigate(`/strategic/games/view/${game.id}`, { state: { strategicGame: game } })}
              />,
            ]
          : undefined,
        pills: [
          <StatPill key="gold" label={t('gold')} value={<MoneyDisplay gold={entity.management.availableGold} />} />,
          <StatPill
            key="xp"
            label={t('xp')}
            hint={t('experience')}
            value={numberFormat.format(entity.management.availableXP)}
          />,
          <StatPill key="characters" label={t('characters')} value={characters?.length ?? '—'} />,
          <StatPill key="levels" label={t('total-levels')} value={totalLevels ?? '—'} />,
        ],
      })}
    >
      {(entity) => (
        <Bento>
          {entity.description && (
            <Box sx={span(12, 12)}>
              <Panel title={t('description')}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {entity.description}
                </Typography>
              </Panel>
            </Box>
          )}
          <Box sx={span(12, 12)}>
            <Panel
              title={t('characters')}
              extra={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
                </Stack>
              }
            >
              {!characters ? (
                <LoadingState />
              ) : characterViewMode === 'table' ? (
                <FactionViewCharactersTable characters={characters} />
              ) : (
                <FactionViewCharacters characters={characters} />
              )}
            </Panel>
          </Box>
          <FactionViewArmory faction={entity} onGoldChanged={state.refresh} />
          <ImageSelectorDialog
            value={entity.imageUrl || DEFAULT_FACTION_IMAGE_PATH}
            open={imageDialogOpen}
            onClose={() => setImageDialogOpen(false)}
            onSelect={(image) => onImageSelected(entity, image)}
          />
        </Bento>
      )}
    </DetailPage>
  );
}
