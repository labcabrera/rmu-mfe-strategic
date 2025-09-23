import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Breadcrumbs, IconButton, Link, Snackbar, Stack } from '@mui/material';
import { updateCharacter } from '../../api/character';
import { Character, CreateCharacterDto } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const CharacterUpdateActions: FC<{
  character: Character;
  game: StrategicGame;
  faction: Faction;
  formData: CreateCharacterDto;
}> = ({ character, game, faction, formData }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdate = () => {
    updateCharacter(character.id, formData)
      .then((data: Character) => navigate(`/strategic/characters/view/${data.id}`, { state: { character: data } }))
      .catch((error: Error) => {
        setDisplayError(true);
        setErrorMessage(`Error updating character: ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleCancel = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character: character } });
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="primary" href="/">
              {t('home')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
              {t('strategic')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
              {t('games')}
            </Link>
            <Link component={RouterLink} color="primary" underline="hover" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Link
              component={RouterLink}
              color="primary"
              underline="hover"
              to={`/strategic/factions/view/${faction.id}`}
            >
              {faction.name}
            </Link>
            <Link
              component={RouterLink}
              color="primary"
              underline="hover"
              to={`/strategic/characters/view/${character.id}`}
              state={{ character }}
            >
              {character.name}
            </Link>
            <span>{t('edit')}</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <CancelButton onClick={handleCancel} />
          <SaveButton onClick={handleUpdate} />
        </Stack>
      </Stack>
      <Snackbar
        open={displayError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleSnackbarClose}
        message={errorMessage}
        action={
          <>
            <IconButton aria-label="close" color="primary" sx={{ p: 0.5 }} onClick={handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    </>
  );
};

export default CharacterUpdateActions;
