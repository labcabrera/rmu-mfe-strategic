import React, { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateFaction } from '../../api/faction';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import CancelButton from '../../shared/buttons/CancelButton';
import SaveButton from '../../shared/buttons/SaveButton';

const FactionUpdateActions: FC<{
  formData: UpdateFactionDto;
  faction: Faction;
  strategicGame: StrategicGame;
}> = ({ formData, faction, strategicGame }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  if (!faction || !strategicGame) return <p>Loading...</p>;

  const handleFactionUpdate = async () => {
    updateFaction(faction.id, formData)
      .then((data: Faction) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const handleCancelClick = () => {
    navigate(`/strategic/factions/view/${faction.id}`, { state: { faction: faction } });
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="primary" underline="hover" href="/">
              Home
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
            <span>{faction.name}</span>
            <span>{t('edit')}</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <CancelButton onClick={handleCancelClick} />
          <SaveButton onClick={handleFactionUpdate} />
        </Stack>
      </Stack>
    </>
  );
};

export default FactionUpdateActions;
