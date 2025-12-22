import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/character';
import CharacterListItem from '../../shared/list-items/CharacterListItem';
import CharacterListActions from './CharacterListActions';

const CharacterList = () => {
  const { showError } = useError();
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    fetchCharacters('', 0, 20)
      .then((data) => setCharacters(data))
      .catch((err) => showError(err.message));
  }, [showError]);

  return (
    <>
      <CharacterListActions />
      <List>
        {characters?.map((item) => (
          <CharacterListItem key={item.id} character={item} />
        ))}
      </List>
    </>
  );
};

export default CharacterList;
