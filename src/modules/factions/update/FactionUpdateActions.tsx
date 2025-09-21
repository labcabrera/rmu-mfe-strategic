import React, { FC, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Breadcrumbs, IconButton, Link, Snackbar, Stack } from '@mui/material';
import { t } from 'i18next';
import { updateFaction } from '../../api/faction';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';

const FactionUpdateActions: FC<{
  formData: UpdateFactionDto;
  faction: Faction;
  game: StrategicGame;
}> = ({ formData, faction, game }) => {
  const navigate = useNavigate();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFactionUpdate = async () => {
    updateFaction(faction.id, formData)
      .then((data: Faction) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((error: Error) => {
        setDisplayError(true);
        setErrorMessage(`Error updating faction: ${error.message}`);
      });
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  const handleCancelClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
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
            <span>{faction.name}</span>
            <span>{t('edit')}</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton onClick={handleCancelClick}>
            <CancelIcon />
          </IconButton>
          <IconButton onClick={handleFactionUpdate}>
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
          <>
            <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    </>
  );
};

export default FactionUpdateActions;
