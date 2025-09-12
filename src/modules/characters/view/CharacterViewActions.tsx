import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Stack, Link, Breadcrumbs, IconButton } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { deleteCharacter, Character, levelUpCharacter } from '../../api/characters';
import { Faction } from '../../api/factions';
import { StrategicGame } from '../../api/strategic-games';
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

  const onLevelUp = () => {
    levelUpCharacter(character.id)
      .then((updated) => {
        setCharacter(updated);
      })
      .catch((err: Error) => {
        showError(err.message);
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
          {levelUpAvailable && <Button onClick={onLevelUp}>Level up</Button>}
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
      <DeleteDialog
        message={`Are you sure you want to delete ${character.name} character? This action cannot be undone.`}
        onDelete={handleDialogDelete}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default CharacterViewActions;
