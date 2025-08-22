import React, { useState } from 'react';

import CharacterCreateActions from './CharacterCreateActions';
import SnackbarError from '../../shared/errors/SnackbarError';
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
        custom: 0,
      },
      co: {
        potential: 60,
        temporary: 57,
        custom: 0,
      },
      em: {
        potential: 57,
        temporary: 40,
        custom: 0,
      },
      in: {
        potential: 98,
        temporary: 45,
        custom: 0,
      },
      me: {
        potential: 79,
        temporary: 43,
        custom: 0,
      },
      pr: {
        potential: 66,
        temporary: 15,
        custom: 0,
      },
      qu: {
        potential: 98,
        temporary: 96,
        custom: 1,
      },
      re: {
        potential: 99,
        temporary: 55,
        custom: 0,
      },
      sd: {
        potential: 43,
        temporary: 42,
        custom: 0,
      },
      st: {
        potential: 83,
        temporary: 61,
        custom: 0,
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
