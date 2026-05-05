import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import { EditableAvatar, Faction, LayoutBase, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { gridSizeMain, gridSizeResume } from '../../services/display';
import { getAvatarImages } from '../../services/image-service';
import FactionForm from '../form/FactionForm';
import FactionUpdateActions from './FactionUpdateActions';

export default function FactionUpdate() {
  const auth = useAuth();
  const { t } = useTranslation();
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
      <LayoutBase
        breadcrumbs={[
          { name: t('home'), link: '/' },
          { name: t('strategic-games'), link: '/strategic/games' },
          { name: t('strategic-game'), link: `/strategic/games/view/${strategicGame.id}` },
          { name: t('faction'), link: `/strategic/factions/view/${faction.id}` },
          { name: t('edit') },
        ]}
        actions={[]}
        leftPanel={
          <EditableAvatar
            imageUrl={formData.imageUrl || ''}
            onImageChange={onImageUpdated}
            images={getAvatarImages()}
          />
        }
      >
        <FactionForm formData={formData} setFormData={setFormData} />
      </LayoutBase>
      <FactionUpdateActions formData={formData} strategicGame={strategicGame} faction={faction} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}></Grid>
        <Grid size={gridSizeMain}>
          <Paper sx={{ p: 2 }}></Paper>
        </Grid>
      </Grid>
    </>
  );
}
