import React, { FC } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateStrategicGame } from '../../api/strategic-game';
import { StrategicGame, UpdateStrategicGameDto } from '../../api/strategic-game.dto';

const StrategicGameUpdateActions: FC<{
  strategicGame: StrategicGame;
  formData: UpdateStrategicGameDto;
}> = ({ strategicGame, formData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useError();

  const updateGame = async () => {
    updateStrategicGame(strategicGame.id, formData)
      .then((data: StrategicGame) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const handleCancelClick = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame } });
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="primary" underline="hover" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
            {t('strategic')}
          </Link>
          <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
            {t('games')}
          </Link>
          <Link
            component={RouterLink}
            color="primary"
            underline="hover"
            to={`/strategic/games/view/${strategicGame.id}`}
            state={{ strategicGame }}
          >
            {strategicGame.name}
          </Link>
          <span>{t('edit')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <IconButton onClick={handleCancelClick} size="large" color="primary">
          <CancelIcon />
        </IconButton>
        <IconButton onClick={updateGame} size="large" color="primary">
          <SaveIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default StrategicGameUpdateActions;
