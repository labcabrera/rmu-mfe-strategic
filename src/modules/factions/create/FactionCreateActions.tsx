import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createFaction } from '../../api/faction';
import { CreateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';

const FactionCreateActions: FC<{
  strategicGame: StrategicGame;
  formData: CreateFactionDto;
}> = ({ strategicGame, formData }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const handleCreate = () => {
    createFaction(formData)
      .then((data: { id: string }) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  return (
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
          <Link component={RouterLink} color="inherit" to={`/strategic/games/view/${strategicGame.id}`}>
            {strategicGame.name}
          </Link>
          <span>{t('create-faction')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <IconButton onClick={handleCreate}>
          <SaveIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default FactionCreateActions;
