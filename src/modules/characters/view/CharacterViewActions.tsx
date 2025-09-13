import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Link,
  Breadcrumbs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useError } from '../../../ErrorContext';
import { Character } from '../../api/character.dto';
import { deleteCharacter, levelUpCharacter } from '../../api/characters';
import { Faction } from '../../api/factions';
import { StrategicGame } from '../../api/strategic-games';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const CharacterViewActions: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  game: StrategicGame;
  faction: Faction;
}> = ({ character, setCharacter, game, faction }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteCharacter(character.id)
      .then(() => {
        navigate(`/strategic/factions/view/${character.factionId}`);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  const levelUpAvailable = character.experience.level <= character.experience.availableLevel;

  const onLevelUp = (force: boolean) => {
    levelUpCharacter(character.id, force)
      .then((updated) => {
        setCharacter(updated);
        setLevelUpDialogOpen(false);
      })
      .catch((err: Error) => {
        //TODO check error code
        if (force === false) {
          setLevelUpDialogOpen(true);
        } else {
          showError(err.message);
        }
      });
  };

  const handleEditClick = () => {
    navigate(`/strategic/characters/edit/${character.id}`, { state: { character } });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDialogDelete = () => {
    handleDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Home
            </Link>
            <Link component={RouterLink} color="inherit" to="/strategic/games">
              {t('strategic')}
            </Link>
            <Link component={RouterLink} color="inherit" to="/strategic/games">
              {t('games')}
            </Link>
            <Link component={RouterLink} color="inherit" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Link component={RouterLink} color="inherit" to={`/strategic/factions/view/${faction.id}`}>
              {faction.name}
            </Link>
            <span>{character.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2}>
          {levelUpAvailable && <Button onClick={() => onLevelUp(false)}>Level up</Button>}
          <EditButton onClick={handleEditClick} />
          <DeleteButton onClick={handleDeleteClick} />
        </Stack>
      </Stack>
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
