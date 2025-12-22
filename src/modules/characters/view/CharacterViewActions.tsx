import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import UploadIcon from '@mui/icons-material/Upload';
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
  Chip,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchCharacter, deleteCharacter, levelUpCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import DeleteButton from '../../shared/buttons/DeleteButton';
import EditButton from '../../shared/buttons/EditButton';
import RefreshButton from '../../shared/buttons/RefreshButton';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';

const CharacterViewActions: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  game: StrategicGame;
  faction: Faction;
}> = ({ character, setCharacter, game, faction }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);
  const levelUpAvailable = character.experience.level < character.experience.availableLevel;

  const onRefresh = () => {
    fetchCharacter(character.id)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  const onDelete = () => {
    deleteCharacter(character.id)
      .then(() => navigate(`/strategic/factions/view/${character.factionId}`, { state: { faction } }))
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
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="primary" href="/">
              {t('home')}
            </Link>
            <Link underline="hover" component={RouterLink} color="primary" to="/strategic/games">
              {t('strategic')}
            </Link>
            <Link underline="hover" component={RouterLink} color="primary" to="/strategic/games">
              {t('games')}
            </Link>
            <Link underline="hover" component={RouterLink} color="primary" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Link
              underline="hover"
              component={RouterLink}
              color="primary"
              to={`/strategic/factions/view/${faction.id}`}
            >
              {faction.name}
            </Link>
            <span>{character.name}</span>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} alignItems={'center'}>
          {levelUpAvailable && (
            <Button onClick={() => onLevelUp(false)} startIcon={<UploadIcon />} variant="outlined" color="primary">
              {t('level-up')}
            </Button>
          )}
          <RefreshButton onClick={onRefresh} />
          <EditButton onClick={onEdit} />
          <DeleteButton onClick={() => setDeleteDialogOpen(true)} />
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
