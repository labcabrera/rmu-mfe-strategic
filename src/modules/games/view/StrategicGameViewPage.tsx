/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Chip, Stack, Typography } from '@mui/material';
import {
  AddButton,
  deleteStrategicGame,
  DetailPage,
  Faction,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGames,
  ImageSelectorDialog,
  imageBaseUrl,
  Panel,
  StatPill,
  StrategicGame,
  TacticalGame,
  updateStrategicGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { Bento, span } from '../../shared/layout/Bento';
import StrategicGameCardChips from '../list/StrategicGameCardChips';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewPowerLevel from './StrategicGameViewPowerLevel';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';

const defaultGameImage = `${imageBaseUrl}images/generic/strategic.png`;

/**
 * Campaign management, with the layout of the character view (spec 017): a header with the image, realm, status
 * chips and key numbers; the description, factions and tactical games; and the settings and power level as
 * label / value panels.
 */
export default function StrategicGameViewPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const notify = useNotify();
  const { gameId } = useParams<{ gameId?: string }>();
  const state = useEntity<StrategicGame>(gameId, (id) => fetchStrategicGame(id, auth), {
    initial: location.state?.strategicGame,
    onError: notify.error,
  });
  const strategicGame = state.entity;
  const [factions, setFactions] = useState<Faction[]>();
  const [tacticalGames, setTacticalGames] = useState<TacticalGame[]>();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    if (!strategicGame) return;
    fetchFactions(`gameId==${strategicGame.id}`, 0, 100, auth)
      .then((data) => setFactions(data.content))
      .catch(notify.error);
    fetchTacticalGames(`strategicGameId==${strategicGame.id}`, 0, 100, auth)
      .then((data) => setTacticalGames(data.content))
      .catch(notify.error);
  }, [strategicGame?.id]);

  const onDelete = (game: StrategicGame) =>
    deleteStrategicGame(game.id, auth)
      .then(() => navigate('/strategic/games', { replace: true }))
      .catch(notify.error);

  const onImageSelected = (game: StrategicGame, imageUrl: string) =>
    updateStrategicGame(game.id, { imageUrl }, auth)
      .then(() => state.setEntity({ ...game, imageUrl }))
      .catch(notify.error);

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: strategicGame?.name ?? t('view') },
      ]}
      entity={state}
      onEdit={(game) => navigate(`/strategic/games/edit/${game.id}`, { state: { strategicGame: game } })}
      onDelete={onDelete}
      hero={(game) => ({
        title: game.name,
        overline: t('strategic-game'),
        image: game.imageUrl || defaultGameImage,
        onImageClick: () => setImageDialogOpen(true),
        imageActionLabel: t('change-image'),
        chips: [
          <Chip
            key="realm"
            label={game.realmName}
            variant="outlined"
            onClick={() => navigate(`/core/realms/view/${game.realmId}`)}
          />,
          <StrategicGameCardChips key="chips" strategicGame={game} />,
        ],
        pills: [
          <StatPill key="factions" label={t('factions')} value={factions === undefined ? '—' : factions.length} />,
          <StatPill
            key="tactical-games"
            label={t('tactical-games')}
            value={tacticalGames === undefined ? '—' : tacticalGames.length}
          />,
          <StatPill
            key="xp"
            label={t('xp')}
            hint={t('experience-multiplier')}
            value={`×${game.options.experienceMultiplier}`}
          />,
          <StatPill key="letality" label={t('letality')} value={game.options.letality} />,
        ],
      })}
    >
      {(game) => (
        <Bento>
          {/* Columns at their content height: the panels (height 100%) would stretch to the taller column. */}
          <Stack spacing={2} sx={{ ...span(12, 8), alignSelf: 'start' }}>
            {game.description && (
              <Panel title={t('description')}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {game.description}
                </Typography>
              </Panel>
            )}
            <Panel
              title={t('factions')}
              extra={
                <AddButton
                  onClick={() =>
                    navigate(`/strategic/factions/create?gameId=${game.id}`, { state: { strategicGame: game } })
                  }
                />
              }
            >
              <StrategicGameViewFactions factions={factions} />
            </Panel>
            <Panel
              title={t('tactical-games')}
              extra={<AddButton onClick={() => navigate(`/tactical/games/create?strategicGame=${game.id}`)} />}
            >
              <StrategicGameViewTacticalGames tacticalGames={tacticalGames} factions={factions} />
            </Panel>
          </Stack>
          <Stack spacing={2} sx={{ ...span(12, 4), alignSelf: 'start' }}>
            <StrategicGameViewAttributes strategicGame={game} />
            <StrategicGameViewPowerLevel strategicGame={game} />
          </Stack>
          <ImageSelectorDialog
            value={game.imageUrl || defaultGameImage}
            open={imageDialogOpen}
            onClose={() => setImageDialogOpen(false)}
            onSelect={(image) => onImageSelected(game, image)}
          />
        </Bento>
      )}
    </DetailPage>
  );
}
