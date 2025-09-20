import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import FactionUpdateActions from './FactionUpdateActions';
import FactionUpdateAttributes from './FactionUpdateAttributes';

const FactionUpdate: FC = () => {
  const location = useLocation();
  const faction = location.state?.faction as Faction;
  const game = location.state?.game as StrategicGame;
  const [formData, setFormData] = useState<UpdateFactionDto>({
    name: faction?.name || '',
    management: {
      availableGold: faction?.management?.availableGold || 0,
      availableXP: faction?.management?.availableXP || 0,
    },
    shortDescription: faction?.shortDescription || '',
    description: faction?.description || '',
  });

  return (
    <>
      <FactionUpdateActions formData={formData} game={game} faction={faction} />
      <FactionUpdateAttributes formData={formData} setFormData={setFormData} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default FactionUpdate;
