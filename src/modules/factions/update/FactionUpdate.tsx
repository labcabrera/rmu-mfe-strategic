import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import { EditableAvatar, Faction, StrategicGame, UpdateFactionDto } from '@labcabrera-rmu/rmu-react-shared-lib';
import { gridSizeMain, gridSizeResume } from '../../services/display';
import { getAvatarImages } from '../../services/image-service';
import FactionForm from '../shared/FactionForm';
import FactionUpdateActions from './FactionUpdateActions';

const FactionUpdate: FC = () => {
  const location = useLocation();
  const faction = location.state?.faction as Faction;
  const strategicGame = location.state?.strategicGame as StrategicGame;
  const [formData, setFormData] = useState<Faction>({
    name: faction?.name || '',
    management: {
      availableGold: faction?.management?.availableGold || 0,
      availableXP: faction?.management?.availableXP || 0,
    },
    shortDescription: faction?.shortDescription || '',
    description: faction?.description || '',
    imageUrl: faction?.imageUrl || '',
  } as unknown as Faction);

  const onImageUpdated = (newImageUrl: string) => {
    setFormData({ ...formData, imageUrl: newImageUrl });
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <EditableAvatar
            imageUrl={formData.imageUrl || ''}
            onImageChange={onImageUpdated}
            images={getAvatarImages()}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <FactionUpdateActions formData={formData} strategicGame={strategicGame} faction={faction} />
          <Paper sx={{ p: 2 }}>
            <FactionForm formData={formData} setFormData={setFormData} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default FactionUpdate;
