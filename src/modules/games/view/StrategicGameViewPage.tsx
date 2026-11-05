/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { Alert, Badge, Button, Chip, Stack, Typography } from '@mui/material';
import {
  AddButton,
  Bento,
  deleteStrategicGame,
  DetailPage,
  Faction,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGames,
  formatCampaignDate,
  gameAccessAtLeast,
  imageBaseUrl,
  ImageSelectorDialog,
  ImportDialog,
  importFaction,
  ImportRequest,
  ImportResult,
  Panel,
  span,
  StatPill,
  StrategicGame,
  TacticalGame,
  updateStrategicGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CreateOrImportButton from '../../shared/CreateOrImportButton';
import { isGameMaster, isGameOwner } from '../../shared/permissions';
import StrategicGameCardChips from '../list/StrategicGameCardChips';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';
import StrategicGameViewJoin from './StrategicGameViewJoin';
import StrategicGameViewPowerLevel from './StrategicGameViewPowerLevel';
import StrategicGameViewTacticalGames from './StrategicGameViewTacticalGames';
import StrategicGameMembersDialog from './members/StrategicGameMembersDialog';
import PassTimeDialog from './time/PassTimeDialog';
import StrategicGameViewCalendar from './time/StrategicGameViewCalendar';
import GroupXpDialog from './xp/GroupXpDialog';

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
  const [importOpen, setImportOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  // Spec 065: the step of time and the reload of its log
  const [passTimeOpen, setPassTimeOpen] = useState(false);
  const [timeLogKey, setTimeLogKey] = useState(0);
  // Spec 079: experience for the group
  const [groupXpOpen, setGroupXpOpen] = useState(false);

  // Spec 071: a public game seen from outside only shows its cover; its factions and tactical games are for members.
  const member = gameAccessAtLeast(strategicGame?.access ?? 'owner', 'spectator');

  useEffect(() => {
    if (!strategicGame || !member) return;
    fetchFactions(`gameId==${strategicGame.id}`, 0, 100, auth)
      .then((data) => setFactions(data.content))
      .catch(notify.error);
    fetchTacticalGames(`strategicGameId==${strategicGame.id}`, 0, 100, auth)
      .then((data) => setTacticalGames(data.content))
      .catch(notify.error);
  }, [strategicGame?.id, member]);

  // After leaving the game (or losing it) there is nothing left to see.
  const onMembersChanged = (updated: StrategicGame) => {
    if (gameAccessAtLeast(updated.access ?? 'owner', 'cover')) state.setEntity(updated);
    else navigate('/strategic/games', { replace: true });
  };
  const onFactionChanged = (faction: Faction) =>
    setFactions((current) => current?.map((f) => (f.id === faction.id ? faction : f)));

  const master = isGameMaster(auth, strategicGame);
  const owner = isGameOwner(auth, strategicGame);

  const onDelete = (game: StrategicGame) =>
    deleteStrategicGame(game.id, auth)
      .then(() => navigate('/strategic/games', { replace: true }))
      .catch(notify.error);

  const onImageSelected = (game: StrategicGame, imageUrl: string) =>
    updateStrategicGame(game.id, { imageUrl }, auth)
      // The stored game, with its new version: the step of time sends it back (spec 065)
      .then((updated) => state.setEntity(updated))
      .catch(notify.error);

  const previewImport = (game: StrategicGame, request: ImportRequest) =>
    importFaction(game.id, request.file, { ...request, dryRun: true }, auth);

  const runImport = (game: StrategicGame, request: ImportRequest) =>
    importFaction(game.id, request.file, { ...request, dryRun: false }, auth);

  const onImported = (result: ImportResult) => {
    setImportOpen(false);
    notify.success(t('import-completed'));
    navigate(`/strategic/factions/view/${result.factionId}`);
  };

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: strategicGame?.name ?? t('view') },
      ]}
      entity={state}
      onEdit={
        master ? (game) => navigate(`/strategic/games/edit/${game.id}`, { state: { strategicGame: game } }) : undefined
      }
      onDelete={owner ? onDelete : undefined}
      actions={(game) =>
        member
          ? [
              <Badge
                key="members"
                color="warning"
                variant="dot"
                invisible={!master || (game.joinRequests ?? []).length === 0}
              >
                <Button variant="outlined" size="small" startIcon={<GroupIcon />} onClick={() => setMembersOpen(true)}>
                  {`${t('game-members-button')} (${(game.members ?? []).length})`}
                </Button>
              </Badge>,
              ...(master
                ? [
                    <Button
                      key="group-xp"
                      variant="outlined"
                      size="small"
                      startIcon={<MilitaryTechIcon />}
                      onClick={() => setGroupXpOpen(true)}
                    >
                      {t('group-xp')}
                    </Button>,
                  ]
                : []),
            ]
          : []
      }
      hero={(game) => ({
        title: game.name,
        overline: t('strategic-game'),
        image: game.imageUrl || defaultGameImage,
        onImageClick: master ? () => setImageDialogOpen(true) : undefined,
        imageActionLabel: t('change-image'),
        chips: [
          <Chip
            key="realm"
            label={game.realmName}
            variant="outlined"
            onClick={() => navigate(`/core/realms/view/${game.realmId}`)}
          />,
          <StrategicGameCardChips key="chips" strategicGame={game} size="medium" />,
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
          <StatPill
            key="day"
            label={t('calendar')}
            hint={formatCampaignDate(game.calendar, t)}
            value={game.calendar?.currentDay ?? 1}
          />,
        ],
      })}
    >
      {(game) => (
        <Bento>
          {/* Columns at their content height: the panels (height 100%) would stretch to the taller column. */}
          <Stack spacing={2} sx={{ ...span(12, 8), alignSelf: 'start' }}>
            {game.realmReadable === false && <Alert severity="warning">{t('game-realm-not-readable')}</Alert>}
            {game.description && (
              <Panel title={t('description')}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {game.description}
                </Typography>
              </Panel>
            )}
            {!member && <StrategicGameViewJoin game={game} />}
            {member && (
              <>
                <StrategicGameViewCalendar
                  game={game}
                  canPassTime={isGameMaster(auth, game)}
                  onPassTime={() => setPassTimeOpen(true)}
                  refreshKey={timeLogKey}
                />
                <Panel
                  title={t('factions')}
                  extra={
                    master && (
                      <CreateOrImportButton
                        onCreate={() =>
                          navigate(`/strategic/factions/create?gameId=${game.id}`, { state: { strategicGame: game } })
                        }
                        onImport={() => setImportOpen(true)}
                      />
                    )
                  }
                >
                  <StrategicGameViewFactions factions={factions} />
                </Panel>
                <Panel
                  title={t('tactical-games')}
                  extra={
                    master && <AddButton onClick={() => navigate(`/tactical/games/create?strategicGame=${game.id}`)} />
                  }
                >
                  <StrategicGameViewTacticalGames tacticalGames={tacticalGames} factions={factions} />
                </Panel>
              </>
            )}
          </Stack>
          <Stack spacing={2} sx={{ ...span(12, 4), alignSelf: 'start' }}>
            <StrategicGameViewAttributes strategicGame={game} />
            <StrategicGameViewPowerLevel strategicGame={game} />
          </Stack>
          {member && (
            <StrategicGameMembersDialog
              open={membersOpen}
              game={game}
              factions={factions}
              onClose={() => setMembersOpen(false)}
              onChanged={onMembersChanged}
              onFactionChanged={onFactionChanged}
            />
          )}
          <ImportDialog
            open={importOpen}
            title={t('import-faction')}
            subtitle={game.name}
            onPreview={(request) => previewImport(game, request)}
            onImport={(request) => runImport(game, request)}
            onImported={onImported}
            onClose={() => setImportOpen(false)}
          />
          <PassTimeDialog
            game={game}
            open={passTimeOpen}
            onClose={() => setPassTimeOpen(false)}
            onPassed={(updated) => {
              state.setEntity(updated);
              setTimeLogKey((key) => key + 1);
            }}
            onConflict={() => state.refresh()}
          />
          {master && <GroupXpDialog game={game} open={groupXpOpen} onClose={() => setGroupXpOpen(false)} />}
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
