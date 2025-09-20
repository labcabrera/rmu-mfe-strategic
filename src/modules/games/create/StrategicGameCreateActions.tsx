import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createStrategicGame } from '../../api/strategic-game';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';

const StrategicGameCreateActions: React.FC<{
  formData: CreateStrategicGameDto;
  isValid: boolean;
}> = ({ formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const createGame = () => {
    createStrategicGame(formData)
      .then((data: { id: string }) => {
        navigate('/strategic/games/view/' + data.id, { state: { strategicGame: data } });
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('Unknown error');
      });
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic">
            {t('strategic')}
          </Link>
          <span>{t('games')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <IconButton onClick={createGame} disabled={!isValid}>
          <SaveIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default StrategicGameCreateActions;
