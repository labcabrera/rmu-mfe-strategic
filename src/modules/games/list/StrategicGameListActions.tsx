import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Box, Breadcrumbs, IconButton, Link, Stack } from '@mui/material';
import { t } from 'i18next';

const StrategicGameListActions: FC = () => {
  const navigate = useNavigate();

  const createNewGame = () => {
    navigate('/strategic/games/create');
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="primary" href="/">
            {t('home')}
          </Link>
          <Link underline="hover" component={RouterLink} color="primary" to="/strategic">
            {t('strategic')}
          </Link>
          <span>{t('games')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <IconButton onClick={createNewGame}>
          <AddCircleIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default StrategicGameListActions;
