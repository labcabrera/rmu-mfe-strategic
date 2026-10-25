/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, ReactElement, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackpackIcon from '@mui/icons-material/Backpack';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HealingIcon from '@mui/icons-material/Healing';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Chip, Stack } from '@mui/material';
import {
  Character,
  ConfirmDialog,
  Culture,
  deleteCharacter,
  DetailPage,
  DownloadButton,
  downloadBlob,
  enterSx,
  exportCharacter,
  fetchCharacter,
  fetchCulture,
  fetchProfession,
  fetchStrategicGame,
  ImageSelectorDialog,
  imageBaseUrl,
  LevelUpButton,
  levelUpCharacter,
  Profession,
  ResourceBar,
  SectionNav,
  StatPill,
  StrategicGame,
  updateCharacter,
  useEntity,
  useNotify,
  useSectionParam,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { healthChips } from '../../shared/chips/CharacterHealthChips';
import { canChangeCharacter } from '../../shared/permissions';
import CharacterHealthSection from './health/CharacterHealthSection';
import { armorLabel } from './sections/CharacterPanels';
import {
  CharacterAttributes,
  CharacterCombat,
  CharacterEquipment,
  CharacterOverview,
  CharacterProgression,
  CharacterSectionId,
  characterSectionIds,
} from './sections/CharacterSections';
import CharacterViewSkills from './skills/CharacterViewSkills';

const defaultCharacterImage = `${imageBaseUrl}images/npcs/unknown.png`;
const sectionIds = [...characterSectionIds];
const sectionIcons: Record<CharacterSectionId, ReactElement> = {
  overview: <DashboardIcon />,
  attributes: <BarChartIcon />,
  skills: <MenuBookIcon />,
  combat: <SportsMmaIcon />,
  health: <HealingIcon />,
  equipment: <BackpackIcon />,
  progression: <TrendingUpIcon />,
};

export default function CharacterViewPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const notify = useNotify();
  const { characterId } = useParams<{ characterId: string }>();
  const state = useEntity<Character>(characterId, (id) => fetchCharacter(id, auth), {
    initial: location.state?.character,
    onError: notify.error,
  });
  const character = state.entity;
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [profession, setProfession] = useState<Profession>();
  const [culture, setCulture] = useState<Culture>();
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [section, setSection] = useSectionParam(sectionIds);

  // The character panels expect a state setter; they never pass an updater function.
  const setCharacter: Dispatch<SetStateAction<Character | undefined>> = (value) => {
    const next = typeof value === 'function' ? value(state.entity) : value;
    if (next) state.setEntity(next);
  };

  useEffect(() => {
    if (!character) return;
    fetchStrategicGame(character.gameId, auth).then(setStrategicGame).catch(notify.error);
    fetchProfession(character.info.professionId, auth).then(setProfession).catch(notify.error);
  }, [character?.gameId, character?.info.professionId]);

  useEffect(() => {
    const cultureId = character?.info.cultureId;
    if (!cultureId) {
      setCulture(undefined);
      return;
    }
    fetchCulture(cultureId, auth).then(setCulture).catch(notify.error);
  }, [character?.info.cultureId]);

  const onLevelUp = (entity: Character, force: boolean) => {
    levelUpCharacter(entity.id, force, auth)
      .then((updated) => {
        state.setEntity(updated);
        setLevelUpDialogOpen(false);
      })
      .catch((err) => {
        if (force === false) setLevelUpDialogOpen(true);
        else notify.error(err);
      });
  };

  const onExport = (entity: Character) =>
    exportCharacter(entity.id, auth)
      .then(({ blob, fileName }) => downloadBlob(blob, fileName))
      .catch(notify.error);

  const onDelete = (entity: Character) =>
    deleteCharacter(entity.id, auth)
      .then(() => navigate(`/strategic/factions/view/${entity.faction.id}`, { replace: true }))
      .catch(notify.error);

  const onImageSelected = (entity: Character, imageUrl: string) =>
    updateCharacter(entity.id, { imageUrl }, auth).then(state.setEntity).catch(notify.error);

  const levelLabel = (entity: Character) => {
    const { level, availableLevel } = entity.experience;
    return level < availableLevel ? `${level} / ${availableLevel}` : `${level}`;
  };

  const renderSection = (entity: Character): Record<CharacterSectionId, ReactNode> => ({
    overview: <CharacterOverview character={entity} strategicGame={strategicGame} go={setSection} />,
    attributes: <CharacterAttributes character={entity} setCharacter={setCharacter} strategicGame={strategicGame} />,
    skills: (
      <CharacterViewSkills
        character={entity}
        setCharacter={setCharacter}
        profession={profession}
        strategicGame={strategicGame}
      />
    ),
    combat: <CharacterCombat character={entity} strategicGame={strategicGame} />,
    health: <CharacterHealthSection character={entity} setCharacter={setCharacter} strategicGame={strategicGame} />,
    equipment: <CharacterEquipment character={entity} setCharacter={setCharacter} />,
    progression: <CharacterProgression character={entity} setCharacter={setCharacter} strategicGame={strategicGame} />,
  });

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters'), link: '/strategic/characters' },
        { name: character?.name ?? t('view') },
      ]}
      entity={state}
      technicalInfo={false}
      actions={(entity) => [
        ...(entity.experience.availableLevel > entity.experience.level
          ? [<LevelUpButton key="level-up" onClick={() => onLevelUp(entity, false)} color="success" />]
          : []),
        ...(canChangeCharacter(auth, entity, strategicGame)
          ? [<DownloadButton key="export" tooltip="export" onClick={() => onExport(entity)} />]
          : []),
      ]}
      onEdit={(entity) => navigate(`/strategic/characters/edit/${entity.id}`, { state: { character: entity } })}
      onDelete={onDelete}
      hero={(entity) => ({
        title: entity.name,
        overline: `${t('level')} ${levelLabel(entity)} · ${t(entity.info.professionId)}`,
        image: entity.imageUrl || defaultCharacterImage,
        onImageClick: () => setImageDialogOpen(true),
        imageActionLabel: t('change-image'),
        chips: [
          <Chip
            key="race"
            label={t(entity.info.race.name)}
            onClick={() => navigate(`/core/races/view/${entity.info.race.id}`)}
          />,
          ...(entity.info.cultureId
            ? [
                <Chip
                  key="culture"
                  label={culture ? t(culture.name) : t('culture')}
                  variant="outlined"
                  onClick={() => navigate(`/core/cultures/view/${entity.info.cultureId}`)}
                />,
              ]
            : []),
          <Chip
            key="faction"
            label={entity.faction.name}
            variant="outlined"
            onClick={() => navigate(`/strategic/factions/view/${entity.faction.id}`)}
          />,
          ...(strategicGame
            ? [
                <Chip
                  key="game"
                  label={strategicGame.name}
                  variant="outlined"
                  onClick={() => navigate(`/strategic/games/view/${strategicGame.id}`)}
                />,
              ]
            : []),
          ...healthChips(entity, t).map((chip) => (
            <Chip
              key={`health-${chip.key}`}
              color={chip.color}
              label={chip.label}
              icon={chip.key === 'injuries' ? <HealingIcon /> : undefined}
              onClick={() => setSection('health')}
            />
          )),
          ...(entity.experience.availableStatLevelUp > 0
            ? [
                <Chip
                  key="stat-updates"
                  color="success"
                  label={t('stat-updates-available', { count: entity.experience.availableStatLevelUp })}
                  onClick={() => setSection('attributes')}
                />,
              ]
            : []),
        ],
        resources: [
          <ResourceBar
            key="hp"
            label={t('hit-points')}
            current={entity.hp.current}
            max={entity.hp.max}
            kind="hp"
            dense
          />,
          ...(entity.power
            ? [
                <ResourceBar
                  key="pp"
                  label={t('power')}
                  current={entity.power.current}
                  max={entity.power.max}
                  kind="pp"
                  dense
                />,
              ]
            : []),
          <ResourceBar
            key="dp"
            label={t('dev-points')}
            current={entity.experience.availableDevPoints}
            max={entity.experience.devPoints}
            kind="xp"
            dense
          />,
        ],
        pills: [
          <StatPill key="db" label={t('bd')} hint={t('db')} value={entity.defense.defensiveBonus} signed />,
          <StatPill key="at" label={t('at-short')} hint={t('at')} value={armorLabel(entity)} />,
          <StatPill
            key="ini"
            label={t('initiative-short')}
            hint={t('initiative')}
            value={entity.initiative.totalBonus}
            signed
          />,
          <StatPill key="bmr" label={t('bmr')} value={entity.movement.baseMovementRate} />,
          <StatPill
            key="mp"
            label={t('maneuver-penalty-short')}
            hint={t('maneuver-penalty')}
            value={entity.equipment.maneuverPenalty}
            signed
          />,
        ],
      })}
    >
      {(entity) => (
        <Stack spacing={2}>
          <SectionNav
            label={t('character-sections')}
            value={section}
            onChange={setSection}
            sections={sectionIds.map((id) => ({ id, label: t(id), icon: sectionIcons[id] }))}
          />
          <Box key={section} sx={enterSx()}>
            {renderSection(entity)[section as CharacterSectionId]}
          </Box>
          <ConfirmDialog
            open={levelUpDialogOpen}
            title={t('level-up')}
            message={t('level-up-confirmation', {
              name: entity.name,
              points: entity.experience.availableDevPoints,
            })}
            confirmLabel={t('level-up')}
            onClose={() => setLevelUpDialogOpen(false)}
            onConfirm={() => onLevelUp(entity, true)}
          />
          <ImageSelectorDialog
            value={entity.imageUrl || defaultCharacterImage}
            open={imageDialogOpen}
            onClose={() => setImageDialogOpen(false)}
            onSelect={(image) => onImageSelected(entity, image)}
          />
        </Stack>
      )}
    </DetailPage>
  );
}
