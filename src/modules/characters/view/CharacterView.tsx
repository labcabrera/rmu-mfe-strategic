import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from '@mui/material';
import {
  Character,
  DeleteButton,
  deleteCharacter,
  DeleteDialog,
  DownloadButton,
  EditButton,
  Faction,
  fetchCharacter,
  fetchFaction,
  fetchProfession,
  fetchRace,
  fetchStrategicGame,
  LayoutBase,
  levelUpCharacter,
  Profession,
  Race,
  RefreshButton,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useError();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character>();
  const [faction, setFaction] = useState<Faction>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [race, setRace] = useState<Race>();
  const [profession, setProfession] = useState<Profession>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);

  const bindCharacter = (characterId: string) => {
    fetchCharacter(characterId, auth)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  const onEdit = () => {
    navigate(`/strategic/characters/edit/${character!.id}`, { state: { character } });
  };

  const onLevelUp = (force: boolean) => {
    levelUpCharacter(character!.id, force, auth)
      .then((updated) => {
        setCharacter(updated);
        setLevelUpDialogOpen(false);
      })
      .catch((err) => {
        if (force === false) {
          setLevelUpDialogOpen(true);
        } else {
          showError(err.message);
        }
      });
  };

  const onDelete = () => {
    deleteCharacter(character!.id, auth)
      .then(() => navigate(`/strategic/factions/view/${character!.faction.id}`))
      .catch((err) => showError(err.message));
  };

  const onDownload = () => {
    if (!character) return;
    try {
      const json = JSON.stringify(character, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const sanitize = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');
      const baseName = character.name ? sanitize(character.name) : `character-${character.id}`;
      const filename = `${baseName}.json`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showError(err?.message || 'Unable to download character');
    }
  };

  useEffect(() => {
    if (character) {
      fetchStrategicGame(character.gameId, auth)
        .then((response) => setStrategicGame(response))
        .catch((err) => showError(err.message));
      fetchProfession(character.info.professionId, auth)
        .then((response) => setProfession(response))
        .catch((err) => showError(err.message));
      fetchFaction(character.faction.id, auth)
        .then((response) => setFaction(response))
        .catch((err) => showError(err.message));
      fetchRace(character.info.race.id, auth)
        .then((response) => setRace(response))
        .catch((err) => showError(err.message));
    }
  }, [character]);

  useEffect(() => {
    if (location && location.state && location.state.character) {
      setCharacter(location.state.character);
    } else if (characterId) {
      bindCharacter(characterId);
    }
  }, [location.state, characterId]);

  const getActions = () => {
    const buttons = [];
    // {levelUpAvailable && <LevelUpButton onClick={() => onLevelUp(false)} color="success" />}
    buttons.push(<RefreshButton onClick={() => bindCharacter(character?.id || '')} />);
    buttons.push(<EditButton onClick={() => onEdit()} />);
    buttons.push(<DownloadButton onClick={onDownload} />);
    buttons.push(<DeleteButton onClick={() => setDeleteDialogOpen(true)} />);
    return buttons;
  };

  if (!character || !setCharacter || !strategicGame || !profession) return <div>Loading...</div>;

  return (
    <>
      <LayoutBase
        breadcrumbs={[
          { name: t('strategic'), link: '/strategic' },
          { name: t('faction'), link: `/strategic/factions/view/${character.faction.id}` },
          { name: t('character') },
        ]}
        actions={getActions()}
        leftPanel={
          <CharacterViewResume
            character={character}
            race={race}
            profession={profession}
            strategicGame={strategicGame}
            faction={faction}
            setCharacter={setCharacter}
          />
        }
      >
        <CharacterViewTabs
          character={character}
          setCharacter={setCharacter}
          strategicGame={strategicGame}
          profession={profession}
        />
      </LayoutBase>
      <DeleteDialog
        message={`Are you sure you want to delete ${character.name} character? This action cannot be undone.`}
        onDelete={onDelete}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />

      <Dialog
        open={levelUpDialogOpen}
        onClose={() => setLevelUpDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Level Up Confirmation'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {character.name} has {character.experience.availableDevPoints} available development points. Are you sure
            you want to level up {character.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLevelUpDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => onLevelUp(true)}>Level Up</Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}></Grid>
        <Grid size={gridSizeMain}>
          <CharacterViewActions character={character} setCharacter={setCharacter} game={strategicGame} />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterView;
