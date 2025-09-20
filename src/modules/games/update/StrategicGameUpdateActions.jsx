/* eslint-disable react/prop-types */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { updateStrategicGame } from '../../api/strategic-game';

const StrategicGameUpdateActions = ({ formData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useError();
  const strategicGame = location.state?.strategicGame;

  const updateGame = async () => {
    updateStrategicGame(strategicGame.id, formData)
      .then((data) => navigate(`/strategic/games/view/${data.id}`, { state: { strategicGame: data } }))
      .catch((error) => {
        showError(error.message);
      });
  };

  const handleCancelClick = () => {
    navigate(`/strategic/games/view/${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Home
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic/games">
            Strategic
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic/games">
            Games
          </Link>
          <span>{strategicGame.name}</span>
          <span>Edit</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <IconButton variant="outlined" onClick={handleCancelClick}>
          <CancelIcon />
        </IconButton>
        <IconButton variant="outlined" onClick={updateGame}>
          <SaveIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default StrategicGameUpdateActions;
