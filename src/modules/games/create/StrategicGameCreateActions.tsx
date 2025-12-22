import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createStrategicGame } from '../../api/strategic-game';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const StrategicGameCreateActions: React.FC<{
  formData: CreateStrategicGameDto;
  isValid: boolean;
}> = ({ formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const createGame = () => {
    createStrategicGame(formData)
      .then((data) => navigate('/strategic/games/view/' + data.id, { state: { strategicGame: data } }))
      .catch((err) => showError(err.message));
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="primary" underline="hover" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} color="primary" underline="hover" to="/strategic">
            {t('strategic')}
          </Link>
          <Link component={RouterLink} color="primary" underline="hover" to="/strategic/games">
            {t('games')}
          </Link>
          <span>{t('Creation')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <CancelButton onClick={() => navigate(-1)} />
        <SaveButton onClick={createGame} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default StrategicGameCreateActions;
