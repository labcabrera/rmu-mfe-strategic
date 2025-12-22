import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { createCharacter } from '../../api/character';
import { CreateCharacterDto } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import SaveButton from '../../shared/buttons/SaveButton';

const CharacterCreateActions: FC<{
  formData: CreateCharacterDto;
  game?: StrategicGame;
  faction?: Faction;
  isValid: boolean;
}> = ({ formData, game, faction, isValid }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onCreate = async () => {
    createCharacter(formData)
      .then((data) => navigate('/strategic/characters/view/' + data.id, { state: { character: data, game: game } }))
      .catch((err) => showError(err.message));
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="primary" href="/">
            {t('home')}
          </Link>
          <Link component={RouterLink} underline="hover" color="primary" to="/strategic/games">
            {t('strategic')}
          </Link>
          <Link component={RouterLink} underline="hover" color="primary" to="/strategic/games">
            {t('games')}
          </Link>
          {game && (
            <Link component={RouterLink} underline="hover" color="primary" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
          )}
          {faction && (
            <Link
              component={RouterLink}
              underline="hover"
              color="primary"
              to={`/strategic/factions/view/${faction.id}`}
            >
              {faction.name}
            </Link>
          )}
          <span>{t('create-character')}</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row">
        <SaveButton onClick={onCreate} disabled={!isValid} />
      </Stack>
    </Stack>
  );
};

export default CharacterCreateActions;
