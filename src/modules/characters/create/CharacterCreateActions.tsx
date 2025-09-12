import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { createCharacter, CreateCharacterDto } from '../../api/characters';
import { StrategicGame } from '../../api/strategic-games';

const CharacterCreateActions: FC<{
  formData: CreateCharacterDto;
  game?: StrategicGame;
}> = ({ formData, game }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();

  const handleCreate = async () => {
    createCharacter(formData)
      .then((data) => {
        navigate('/strategic/characters/view/' + data.id, { state: { character: data, game: game } });
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic/games">
            {t('strategic')}
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic/characters">
            {t('characters')}
          </Link>
          <span>{t('create')}</span>
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

export default CharacterCreateActions;
