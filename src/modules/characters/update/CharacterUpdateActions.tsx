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
            <Link underline="hover" color="inherit" href="/">
              {t('home')}
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
            <Link component={RouterLink} color="inherit" to={`/strategic/characters/view/${character.id}`}>
              {character.name}
            </Link>
            <span>{t('edit')}</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton onClick={handleCancel}>
            <CancelIcon />
          </IconButton>
          <IconButton onClick={handleUpdate}>
            <SaveIcon />
          </IconButton>
        </Stack>
      </Stack>
      <Snackbar
        open={displayError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleSnackbarClose}
        message={errorMessage}
        action={
          <React.Fragment>
            <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
};

export default CharacterUpdateActions;
