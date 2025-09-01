import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { fetchStrategicGame } from '../../api/strategic-games';
import StrategicGameViewActions from './StrategicGameViewActions';
import StrategicGameViewAttributes from './StrategicGameViewAttributes';
import StrategicGameViewFactions from './StrategicGameViewFactions';

const StrategicGameView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const [strategicGame, setStrategicGame] = useState(location.state?.strategicGame || null);
  const [realm, setRealm] = useState(null);

  const bindStrategicGame = async () => {
    try {
      console.log('Binding strategic game:', gameId);
      const game = await fetchStrategicGame(gameId);
      console.log('Fetched strategic game:', game);
      setStrategicGame(game);
    } catch (err) {
      console.log('Error binding strategic games', err);
    }
  };

  const getRealmName = async () => {
    const url = `${process.env.RMU_API_CORE_URL}/realms/${strategicGame.realm}`;
    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      setRealm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateCharacter = () => {
    navigate(`/strategic/characters/create?gameId=${strategicGame.id}`, { state: { strategicGame: strategicGame } });
  };

  useEffect(() => {
    console.log('StrategicGameView useEffect - gameId:', gameId, ' strategicGame:', strategicGame);
    if (!strategicGame && gameId) {
      bindStrategicGame();
    } else {
      getRealmName();
    }
  }, [strategicGame, gameId]);

  if (!strategicGame) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameViewActions strategicGame={strategicGame} />
      <StrategicGameViewAttributes strategicGame={strategicGame} realm={realm} />
      <StrategicGameViewFactions strategicGame={strategicGame} />
      <Button variant="outlined" onClick={() => handleCreateCharacter()}>
        Add character
      </Button>
    </>
  );
};

export default StrategicGameView;
