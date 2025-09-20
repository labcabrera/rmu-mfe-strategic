import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import { fetchFactions } from '../../api/faction';
import FactionListActions from './FactionListActions';
import FactionListItem from './FactionListItem';

const FactionList = () => {
  const [factions, setFactions] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindFactions = async () => {
    try {
      const games = await fetchFactions('', 0, 10);
      setFactions(games);
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error fetching factions. ${error.message}`);
    }
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  useEffect(() => {
    bindFactions();
  }, []);

  return (
    <>
      <FactionListActions />
      <List>
        {factions?.map((item) => (
          <FactionListItem key={item.id} strategicGame={item} />
        ))}
      </List>
      <Snackbar
        open={displayError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleSnackbarClose}
        message={errorMessage}
        action={
          <React.Fragment>
            <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
};

export default FactionList;
