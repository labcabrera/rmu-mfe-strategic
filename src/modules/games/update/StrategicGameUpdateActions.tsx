import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateStrategicGame } from '../../api/strategic-game';
import { StrategicGame, UpdateStrategicGameDto } from '../../api/strategic-game.dto';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const StrategicGameUpdateActions: FC<{
  strategicGame: StrategicGame;
  formData: UpdateStrategicGameDto;
}> = ({ strategicGame, formData }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onUpdateGame = async () => {
    updateStrategicGame(strategicGame.id, formData)
      .then((data: StrategicGame) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
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
      <Stack spacing={2} direction="row">
        <CancelButton onClick={onCancel} />
        <SaveButton onClick={onUpdateGame} />
      </Stack>
    </Stack>
  );
};

export default StrategicGameUpdateActions;
