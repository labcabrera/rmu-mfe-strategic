/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Character,
  ConfirmDialog,
  deleteCharacter,
  DetailPage,
  DownloadButton,
  Faction,
  fetchCharacter,
  fetchFaction,
  fetchProfession,
  fetchRace,
  fetchStrategicGame,
  LevelUpButton,
  levelUpCharacter,
  Profession,
  Race,
  StrategicGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

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
  const [faction, setFaction] = useState<Faction>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [race, setRace] = useState<Race>();
  const [profession, setProfession] = useState<Profession>();
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);

  // The character panels expect a state setter; they never pass an updater function.
  const setCharacter: Dispatch<SetStateAction<Character | undefined>> = (value) => {
    const next = typeof value === 'function' ? value(state.entity) : value;
    if (next) state.setEntity(next);
  };

  useEffect(() => {
    if (!character) return;
    fetchStrategicGame(character.gameId, auth).then(setStrategicGame).catch(notify.error);
    fetchProfession(character.info.professionId, auth).then(setProfession).catch(notify.error);
    fetchFaction(character.faction.id, auth).then(setFaction).catch(notify.error);
    fetchRace(character.info.race.id, auth).then(setRace).catch(notify.error);
  }, [character]);

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

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('characters'), link: '/strategic/characters' },
        { name: t('view') },
      ]}
      entity={state}
      summaryTitle={(entity) => t(entity.name)}
      technicalInfo={false}
      actions={(entity) => [
        ...(entity.experience.availableLevel > entity.experience.level
          ? [<LevelUpButton key="level-up" onClick={() => onLevelUp(entity, false)} color="success" />]
          : []),
        <DownloadButton key="download" onClick={() => onDownload(entity)} />,
      ]}
      onEdit={(entity) => navigate(`/strategic/characters/edit/${entity.id}`, { state: { character: entity } })}
      onDelete={onDelete}
      leftPanel={(entity) => (
        <CharacterViewResume
          character={entity}
          race={race}
          profession={profession}
          strategicGame={strategicGame}
          faction={faction}
          setCharacter={setCharacter}
        />
      )}
    >
      {(entity) => (
        <>
          <CharacterViewTabs
            character={entity}
            setCharacter={setCharacter}
            strategicGame={strategicGame}
            profession={profession}
          />
          <ConfirmDialog
            open={levelUpDialogOpen}
            title={t('level-up')}
            message={`${entity.name} has ${entity.experience.availableDevPoints} available development points. Are you sure you want to level up ${entity.name}? This action cannot be undone.`}
            confirmLabel={t('level-up')}
            onClose={() => setLevelUpDialogOpen(false)}
            onConfirm={() => onLevelUp(entity, true)}
          />
        </>
      )}
    </DetailPage>
  );
}
