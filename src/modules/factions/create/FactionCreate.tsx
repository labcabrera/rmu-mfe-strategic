import React, { FC, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { CreateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-games';
import FactionCreateActions from './FactionCreateActions';
import FactionCreateAttributes from './FactionCreateAttributes';

const FactionCreate: FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [strategicGame] = useState<StrategicGame | null>(location.state?.strategicGame || null);
  const [formData, setFormData] = useState<CreateFactionDto>({
    gameId: gameId,
    name: '',
    availableGold: 100,
    availableXP: 200000,
    description: '',
  });

  return (
    <>
      <FactionCreateActions formData={formData} strategicGame={strategicGame} />
      <FactionCreateAttributes formData={formData} setFormData={setFormData} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default FactionCreate;
