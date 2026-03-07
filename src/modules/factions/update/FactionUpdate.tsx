import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import EditableAvatar from '../../shared/avatars/EditableAvatar';
import FactionAvatar from '../../shared/avatars/FactionAvatar';
import FactionUpdateActions from './FactionUpdateActions';
import FactionUpdateAttributes from './FactionUpdateAttributes';
import FactionUpdateResume from './FactionUpdateResume';

const FactionUpdate: FC = () => {
  const location = useLocation();
  const faction = location.state?.faction as Faction;
  const strategicGame = location.state?.strategicGame as StrategicGame;
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
      <FactionUpdateActions formData={formData} strategicGame={strategicGame} faction={faction} />
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 3 }}>
          <EditableAvatar
            imageUrl={''}
            onImageChange={function (newImageUrl: string): void {
              throw new Error('Function not implemented.');
            }}
          />
          <FactionUpdateResume formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <FactionUpdateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
    </>
  );
};

export default FactionUpdate;
