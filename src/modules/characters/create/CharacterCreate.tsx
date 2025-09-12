import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useError } from '../../../ErrorContext';
import { CreateCharacterDto } from '../../api/characters';
import { fetchStrategicGame, StrategicGame } from '../../api/strategic-games';
import { characterCreateTemplate } from '../../data/character-create';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateAttributes from './CharacterCreateAttributes';

const CharacterCreate: FC = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const factionId = searchParams.get('factionId');
  const { showError } = useError();
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<CreateCharacterDto>(characterCreateTemplate);

  const bindStrategicGame = () => {
    if (!gameId) return;
    fetchStrategicGame(gameId)
      .then((game) => {
        setGame(game);
      })
      .catch((error: Error) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
