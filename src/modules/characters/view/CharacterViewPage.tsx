/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Chip, Stack } from '@mui/material';
import {
  Character,
  ConfirmDialog,
  deleteCharacter,
  DetailPage,
  DownloadButton,
  enterSx,
  fetchCharacter,
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

/** Downloads the character as a JSON file. */
const downloadCharacter = (character: Character) => {
  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const sanitize = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name ? sanitize(character.name) : `character-${character.id}`}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

  const onDownload = (entity: Character) => {
    try {
      downloadCharacter(entity);
    } catch (err) {
      notify.error(err);
    }
  };

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
    attributes: <CharacterAttributes character={entity} setCharacter={setCharacter} />,
    skills: <CharacterViewSkills character={entity} setCharacter={setCharacter} profession={profession} />,
    combat: <CharacterCombat character={entity} strategicGame={strategicGame} />,
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
        <DownloadButton key="download" onClick={() => onDownload(entity)} />,
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
          <Chip key="realm" label={t(entity.info.realmType)} variant="outlined" />,
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
            sections={sectionIds.map((id) => ({ id, label: t(id) }))}
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
