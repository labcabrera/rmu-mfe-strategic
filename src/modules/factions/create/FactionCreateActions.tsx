import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createFaction } from '../../api/faction';
import { CreateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const FactionCreateActions: FC<{
  strategicGame: StrategicGame;
  formData: CreateFactionDto;
  isValid: boolean;
}> = ({ strategicGame, formData, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onCreate = () => {
    createFaction(formData)
      .then((data: { id: string }) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((err) => showError(err.message));
  };

  return (
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
          <Link
            component={RouterLink}
            color="primary"
            underline="hover"
            to={`/strategic/games/view/${strategicGame.id}`}
          >
            {strategicGame.name}
          </Link>
          <span>{t('create-faction')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row">
        <CancelButton onClick={() => navigate(-1)} />
        <SaveButton onClick={onCreate} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default FactionCreateActions;
