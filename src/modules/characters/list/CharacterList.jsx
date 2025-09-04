import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import { fetchCharacters } from '../../api/characters';
import SnackbarError from '../../shared/errors/SnackbarError';
import CharacterListItem from '../../shared/list-items/CharacterListItem';
import CharacterListActions from './CharacterListActions';

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindCharacters = async () => {
    fetchCharacters('', 0, 20)
      .then(() => setCharacters(characters))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error fetching characters. ${error.message}`);
      });
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
      <SnackbarError displayError={displayError} errorMessage={errorMessage} handleClose={handleSnackbarClose} />
    </>
  );
};

export default CharacterList;
