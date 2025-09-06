/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useError } from '../../../ErrorContext';
import { createFaction } from '../../api/factions';

const FactionCreateActions = ({ strategicGame, formData }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const handleCreate = () => {
    createFaction(formData)
      .then((data) => navigate(`/strategic/factions/view/${data.id}`, { state: { faction: data } }))
      .catch((err) => {
        showError(err.message);
      });
  };

  return (
    <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic/games">
            Strategic
          </Link>
          <Link component={RouterLink} color="inherit" to="/strategic/games">
            Games
          </Link>
          <Link component={RouterLink} color="inherit" to={`/strategic/games/view/${strategicGame.id}`}>
            {strategicGame.name}
          </Link>
          <span>Create faction</span>
        </Breadcrumbs>
      </Box>
      <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <IconButton variant="outlined" onClick={handleCreate}>
          <SaveIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default FactionCreateActions;
