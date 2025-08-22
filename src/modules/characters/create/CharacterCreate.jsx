import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import CharacterCreateActions from './CharacterCreateActions';
import SnackbarError from '../../shared/errors/SnackbarError';
import CharacterCreateAttributes from './CharacterCreateAttributes';

const CharacterCreate = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: 'Generic character',
    gameId: '',
    factionId: '',
    info: {
      level: 0,
      race: '',
      professionId: '',
      height: 7,
      weight: 120,
    },
    experience: {
      level: 0,
      xp: 10100,
    },
    statistics: {
      ag: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      co: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      em: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      in: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      me: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      pr: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      qu: {
        potential: 50,
        temporary: 50,
        racial: 1,
      },
      re: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      sd: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
      st: {
        potential: 50,
        temporary: 50,
        racial: 0,
      },
    },
    movement: {
      strideCustomBonus: 1,
    },
    defense: {},
    endurance: {
      customBonus: 5,
    },
    power: {
      max: 0,
    },
    initiative: {
      customBonus: 1,
    },
    skills: [
      {
        skillId: 'perception',
        ranks: 0,
        customBonus: 5,
      },
    ],
    items: [
      {
        name: 'Ork scimitar',
        itemTypeId: 'scimitar',
        info: {
          bonus: 5,
        },
      },
      {
        name: 'Ork dagger',
        itemTypeId: 'dagger',
        info: {
          bonus: 0,
        },
      },
      {
        itemTypeId: 'target-shield',
      },
      {
        itemTypeId: 'rigid-leather-full-suit',
      },
    ],
    description: 'Lorem ipsum',
  });

  useEffect(() => {
    if (gameId) {
      setFormData((prevState) => ({
        ...prevState,
        gameId: gameId,
      }));
    }
  }, [gameId]);

  return (
    <>
      <CharacterCreateActions formData={formData} />
      <CharacterCreateAttributes formData={formData} setFormData={setFormData} />
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default CharacterCreate;
