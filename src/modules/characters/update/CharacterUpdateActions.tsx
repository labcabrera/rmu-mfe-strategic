import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateCharacter } from '../../api/character';
import { Character, CreateCharacterDto } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const CharacterUpdateActions: FC<{
  character: Character;
  game: StrategicGame;
  faction: Faction;
  formData: CreateCharacterDto;
}> = ({ character, game, faction, formData }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const onUpdate = () => {
    updateCharacter(character.id, formData)
      .then((data: Character) => navigate(`/strategic/characters/view/${data.id}`, { state: { character: data } }))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character: character } });
  };

  return (
    <>
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
            <Link component={RouterLink} color="primary" underline="hover" to={`/strategic/games/view/${game.id}`}>
              {game.name}
            </Link>
            <Link
              component={RouterLink}
              color="primary"
              underline="hover"
              to={`/strategic/factions/view/${faction.id}`}
            >
              {faction.name}
            </Link>
            <Link
              component={RouterLink}
              color="primary"
              underline="hover"
              to={`/strategic/characters/view/${character.id}`}
              state={{ character }}
            >
              {character.name}
            </Link>
            <span>{t('edit')}</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row">
          <CancelButton onClick={onCancel} />
          <SaveButton onClick={onUpdate} />
        </Stack>
      </Stack>
    </>
  );
};

export default CharacterUpdateActions;
