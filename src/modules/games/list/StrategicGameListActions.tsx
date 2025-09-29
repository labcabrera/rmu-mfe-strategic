import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import AddButton from '../../shared/buttons/AddButton';

const StrategicGameListActions: FC = () => {
  const navigate = useNavigate();

  const onCreateNewGame = () => {
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
      <Stack spacing={2} direction="row">
        <AddButton onClick={onCreateNewGame} />
      </Stack>
    </Stack>
  );
};

export default StrategicGameListActions;
