import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import { fetchFactions } from '../../api/faction';
import FactionListActions from './FactionListActions';
import FactionListItem from './FactionListItem';

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
      <List>
        {factions?.map((item) => (
          <FactionListItem key={item.id} strategicGame={item} />
        ))}
      </List>
    </>
  );
};

export default FactionList;
