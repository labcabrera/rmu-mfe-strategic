import React, { useEffect, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import CharacterCreateActions from './CharacterCreateActions';
import SnackbarError from '../../shared/errors/SnackbarError';
import SelectRace from '../../shared/selects/SelectRace';
import CharacterCreateAttributes from './CharacterCreateAttributes';

const CharacterCreate = () => {
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: 'Orc - Scimitar - Lvl 2',
    gameId: '{{strategic-game-id}}',
    factionId: '',
    info: {
      level: 2,
      race: '',
      professionId: 'rogue',
      sizeId: 'medium',
      height: 7,
      weight: 120,
    },
    experience: {
      level: 0,
      xp: 10100,
    },
    statistics: {
      ag: {
        potential: 78,
        temporary: 45,
      },
      qu: {
        potential: 98,
        temporary: 96,
        custom: 1,
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
