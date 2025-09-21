import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import FactionAvatar from '../../shared/avatars/FactionAvatar';
import FactionUpdateActions from './FactionUpdateActions';
import FactionUpdateAttributes from './FactionUpdateAttributes';
import FactionUpdateResume from './FactionUpdateResume';

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
      <Grid container spacing={5}>
        <Grid size={2}>
          <FactionAvatar faction={faction} size={300} />
          <FactionUpdateResume formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={7}>
          <FactionUpdateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default FactionUpdate;
