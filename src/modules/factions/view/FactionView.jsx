import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { fetchFaction } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import FactionViewActions from './FactionViewActions';
import FactionViewAttributes from './FactionViewAttributes';
import FactionViewCharacters from './FactionViewCharacters';

const FactionView = () => {
  const location = useLocation();
  const { factionId } = useParams();
  const [faction, setFaction] = useState(location.state?.faction || null);
  const [strategicGame, setStrategicGame] = useState(null);

  const bindFaction = async (faction) => {
    setFaction(await fetchFaction(factionId));
    console.log('fetching game ' + faction.gameId);
    await bindGame();
  };

  const bindGame = async () => {
    console.log('fetching game ' + faction.gameId);
    const strategicGame = await fetchStrategicGame(faction.gameId);
    setStrategicGame(strategicGame);
    console.log('game ok ' + faction.gameId);
  };

  useEffect(() => {
    if (!faction && factionId) {
      bindFaction(faction);
    } else {
      bindGame();
    }
  }, [faction, factionId]);

  if (!faction || !strategicGame) return <div>Loading...</div>;

  return (
    <>
      <FactionViewActions faction={faction} />
      <FactionViewAttributes faction={faction} setFaction={setFaction} strategicGame={strategicGame} />
      <FactionViewCharacters faction={faction} />
      <pre>{JSON.stringify(faction, null, 2)}</pre>
    </>
  );
};

export default FactionView;
