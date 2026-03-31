import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import { EditableAvatar } from '@labcabrera-rmu/rmu-react-shared-lib';
import { Faction, UpdateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { getAvatarImages } from '../../services/image-service';
import FactionForm from '../shared/FactionForm';
import FactionUpdateActions from './FactionUpdateActions';

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
    imageUrl: faction?.imageUrl || '',
  });

  const onImageUpdated = (newImageUrl: string) => {
    setFormData({ ...formData, imageUrl: newImageUrl });
  };

  return (
    <>
      <FactionUpdateActions formData={formData} strategicGame={strategicGame} faction={faction} />
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 2 }}>
          <EditableAvatar
            imageUrl={formData.imageUrl || ''}
            onImageChange={onImageUpdated}
            images={getAvatarImages()}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <FactionForm formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
    </>
  );
};

export default FactionUpdate;
