import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { fetchFactions } from '../../api/faction';
import FactionListActions from './FactionListActions';

const FactionList = () => {
  const { showError } = useError();
  const [factions, setFactions] = useState([]);

  useEffect(() => {
    fetchFactions(20, 0, 10)
      .then((data) => setFactions(data))
      .catch((err) => showError(err.message));
  }, []);

  return (
    <>
      <FactionListActions />
      <Grid container spacing={1}>
        {factions?.map((item) => (
          <Grid size={12} key={item.id}>
            <RmuTextCard title={item.name} subtitle={item.description} onClick={() => alert('todo')} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default FactionList;
