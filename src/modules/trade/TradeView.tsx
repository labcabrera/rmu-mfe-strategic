import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../ErrorContext';
import { fetchCharacter } from '../api/character';
import { Character } from '../api/character.dto';
import TradeViewActions from './TradeViewActions';
import TradeViewItemSearch from './TradeViewItemSearch';
import TradeViewOptions from './TradeViewOptions';

const TradeView: FC = () => {
  const { showError } = useError();
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [communicationsType, setCommunicationsType] = useState<string>('local');
  const [itemType, setItemType] = useState<string>('usual');
  const [formData, setFormData] = useState<any>({
    communications: 'normal',
    population: 'normal',
    economy: 'normal',
    trade: 'none',
    itemType: 'normal',
    languageOptions: 'none',
  });

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((c) => setCharacter(c))
        .catch((err) => showError(err.message));
    }
  }, [characterId]);

  if (!character) return <p>Loading...</p>;

  return (
    <>
      <TradeViewActions character={character} setCharacter={setCharacter} />

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2 }}>Resume</Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TradeViewOptions
            character={character}
            setCharacter={setCharacter}
            formData={formData}
            setFormData={setFormData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>{formData?.option === 'buy' && <TradeViewItemSearch />}</Grid>
        <Grid size={12}>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </Grid>
      </Grid>
    </>
  );
};

export default TradeView;
