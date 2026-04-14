import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import {
  RmuBreadcrumbs,
  RefreshButton,
  EditButton,
  DownloadButton,
  DeleteButton,
  DeleteDialog,
  StrategicGame,
  Character,
  fetchCharacter,
  deleteCharacter,
  levelUpCharacter,
  LevelUpButton,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';

const CharacterViewActions: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  game: StrategicGame;
}> = ({ character, setCharacter, game }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);
  const levelUpAvailable = character.experience.level < character.experience.availableLevel;
  const breadcrumbs = [
    { name: t('Strategic'), link: '/strategic' },
    { name: t('Faction'), link: `/strategic/factions/view/${character.faction.id}` },
    { name: t('Character') },
  ];

  const onRefresh = () => {
    fetchCharacter(character.id)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  const onDelete = () => {
    deleteCharacter(character.id)
      .then(() => navigate(`/strategic/factions/view/${character.faction.id}`))
      .catch((err) => showError(err.message));
  };

  const onLevelUp = (force: boolean) => {
    levelUpCharacter(character.id, force)
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

  const onEdit = () => {
    navigate(`/strategic/characters/edit/${character.id}`, { state: { character } });
  };

  const onDownload = () => {
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

  const handleDialogDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <RmuBreadcrumbs items={breadcrumbs}>
        {levelUpAvailable && <LevelUpButton onClick={() => onLevelUp(false)} color="success" />}
        <RefreshButton onClick={onRefresh} />
        <EditButton onClick={onEdit} />
        <DownloadButton onClick={onDownload} />
        <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
      </RmuBreadcrumbs>

      <DeleteDialog
        message={`Are you sure you want to delete ${character.name} character? This action cannot be undone.`}
        onDelete={handleDialogDelete}
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
    </>
  );
};

export default CharacterViewActions;
