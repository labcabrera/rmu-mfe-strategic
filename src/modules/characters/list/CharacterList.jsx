import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/character';
import RmuTextCard from '../../shared/cards/RmuTextCard';
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
      <Grid container spacing={1}>
        {characters?.map((item) => (
          <Grid size={12} key={item.id}>
            <RmuTextCard title={item.name} subtitle={item.description} onClick={() => alert('todo')} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CharacterList;
