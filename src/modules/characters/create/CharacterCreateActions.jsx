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
import { createCharacter } from '../../api/characters';

const CharacterCreateActions = ({ formData, game }) => {
  const navigate = useNavigate();
  const { showError } = useError();

  const handleCreate = async () => {
    createCharacter(formData)
      .then((data) => {
        navigate('/strategic/characters/view/' + data.id, { state: { character: data, game: game } });
      })
      .catch((err) => {
        showError(err.message);
      });
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
          <Link component={RouterLink} color="inherit" to="/strategic/characters">
            Characters
          </Link>
          <span>Create</span>
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

export default CharacterCreateActions;
