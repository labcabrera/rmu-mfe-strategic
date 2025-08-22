import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import CharacterCreateActions from './CharacterCreateActions';
import SnackbarError from '../../shared/errors/SnackbarError';
import CharacterCreateAttributes from './CharacterCreateAttributes';
import { characterCreateTemplate } from '../../data/character-create';
import { fetchStrategicGame } from '../../api/strategic-games';

const CharacterCreate = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [strategicGame, setStrategicGame] = useState(null);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState(characterCreateTemplate);

  const bindStrategicGame = async () => {
    try {
      const game = await fetchStrategicGame(gameId);
      setStrategicGame(game);
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error loading game. ${error.message}`);
    }
  };

  useEffect(() => {
    if (gameId) {
      bindStrategicGame();
      setFormData((prevState) => ({
        ...prevState,
        gameId: gameId,
      }));
    }
  }, [gameId]);

  return (
    <>
      <CharacterCreateActions formData={formData} />
      <CharacterCreateAttributes formData={formData} strategicGame={strategicGame} setFormData={setFormData} />
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default CharacterCreate;
