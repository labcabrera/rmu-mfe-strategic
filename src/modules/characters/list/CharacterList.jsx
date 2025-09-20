import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/character';
import CharacterListItem from '../../shared/list-items/CharacterListItem';
import CharacterListActions from './CharacterListActions';

const CharacterList = () => {
  const { showError } = useError();
  const [characters, setCharacters] = useState([]);

  const bindCharacters = async () => {
    fetchCharacters('', 0, 20)
      .then(() => setCharacters(characters))
      .catch((error) => {
        showError(error.message);
      });
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
    </>
  );
};

export default CharacterList;
