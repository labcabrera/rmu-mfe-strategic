import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import { fetchCharacters } from '../../api/characters';
import CharacterListItem from '../../shared/list-items/CharacterListItem';
import CharacterListActions from './CharacterListActions';

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindCharacters = async () => {
    try {
      const games = await fetchCharacters('', 0, 10);
      setCharacters(games);
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error fetching factions. ${error.message}`);
    }
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  useEffect(() => {
    bindCharacters();
  }, []);

  return (
    <>
      <CharacterListActions />
      <List>
        {characters?.map((item) => (
          <CharacterListItem key={item.id} character={item} />
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

export default CharacterList;
