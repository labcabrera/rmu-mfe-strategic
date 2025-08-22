import React from 'react';
import { useNavigate } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import AddIcon from '@mui/icons-material/Add';

const CharacterListActions = () => {
  const navigate = useNavigate();

  const handleCreate = async () => {
    navigate('/strategic/characters/create');
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
            <span>Characters</span>
          </Breadcrumbs>
        </Box>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
          <IconButton variant="outlined" onClick={handleCreate}>
            <AddIcon />
          </IconButton>
        </Stack>
      </Stack>
    </>
  );
};

export default CharacterListActions;
