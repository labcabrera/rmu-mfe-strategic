import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGame } from '../../api/strategic-games';
import { characterCreateTemplate } from '../../data/character-create';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateAttributes from './CharacterCreateAttributes';

const CharacterCreate = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const factionId = searchParams.get('factionId');
  const { showError } = useError();
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState(characterCreateTemplate);

  const bindStrategicGame = () => {
    fetchStrategicGame(gameId)
      .then((game) => {
        setGame(game);
      })
      .catch((error) => {
        showError(error.message);
      });
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

  useEffect(() => {
    if (factionId) {
      setFormData((prevState) => ({
        ...prevState,
        factionId: factionId,
      }));
    }
  }, [factionId]);

  return (
    <>
      <CharacterCreateActions formData={formData} game={game} />
      <CharacterCreateAttributes formData={formData} strategicGame={game} setFormData={setFormData} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default CharacterCreate;
