import React, { useEffect, useState } from 'react';
import { List, Grid } from '@mui/material';
import { LayoutBase, RmuTextCard, Page } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

export default function CharacterList() {
  const { showError } = useError();

  const [pageData, setPageData] = useState([]);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    fetchCharacters('', 0, 20)
      .then((data) => setCharacters(data))
      .catch((err) => showError(err.message));
  }, [showError]);

  return (
    <LayoutBase breadcrumbs={[{ label: 'home', path: '/' }, { label: 'characters' }]}>
      <Grid container spacing={1}>
        {characters?.map((item) => (
          <Grid size={12} key={item.id}>
            <RmuTextCard title={item.name} subtitle={item.description} onClick={() => alert('todo')} />
          </Grid>
        ))}
      </Grid>
    </LayoutBase>
  );
}
