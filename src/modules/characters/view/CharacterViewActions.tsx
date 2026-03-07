import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchCharacter, deleteCharacter, levelUpCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import RmuBreadcrumbs from '../../shared/breadcrumbs/RmuBreadcrumbs';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import LevelUpButton from '../../shared/buttons/LevelUpButton';
import RefreshButton from '../../shared/buttons/RefreshButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

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
    { name: t('Game'), link: `/strategic/games/view/${game.id}` },
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
            {character.name} has {character.experience.availableDevelopmentPoints} available development points. Are you
            sure you want to level up {character.name}? This action cannot be undone.
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
