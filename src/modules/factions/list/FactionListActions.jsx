import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { AddButton, RmuBreadcrumbs } from '@labcabrera-rmu/rmu-react-shared-lib';

const FactionListActions = () => {
  const navigate = useNavigate();
  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Strategic', path: '/strategic' },
    { label: 'Factions', path: '/strategic/factions' },
  ];

  const createNewGame = async () => {
    navigate('/strategic/games/create');
  };

  return (
    <RmuBreadcrumbs items={breadcrumbs}>
      <AddButton onClick={createNewGame} />
    </RmuBreadcrumbs>
  );
};

export default FactionListActions;
