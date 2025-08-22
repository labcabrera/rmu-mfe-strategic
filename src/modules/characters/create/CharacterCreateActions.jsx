/* eslint-disable react/prop-types */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import SaveIcon from '@mui/icons-material/Save';

import { createCharacter } from '../../api/characters';
import SnackbarError from '../../shared/errors/SnackbarError';

const CharacterCreateActions = ({ formData }) => {
  const navigate = useNavigate();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreate = async () => {
    try {
      const data = await createCharacter(formData);
      navigate('/strategic/characters/view/' + data.id, { state: { character: data } });
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error creating character: ${error.message}`);
    }
  };

  return (
    <>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 80 }}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/strategic">
              Strategic
            </Link>
            <span>Games</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton variant="outlined" onClick={handleCreate}>
            <SaveIcon />
          </IconButton>
        </Stack>
      </Stack>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </>
  );
};

export default CharacterCreateActions;
