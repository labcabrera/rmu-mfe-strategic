import React, { FC, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Typography } from '@mui/material';
import { EditableAvatar, Faction, StrategicGame, updateFaction } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { getAvatarImages } from '../../services/image-service';

const FactionViewResume: FC<{
  faction: Faction;
  setFaction: (faction: Faction) => void;
  game: StrategicGame;
}> = ({ faction, setFaction, game }) => {
  const auth = useAuth();
  const { showError } = useError();

  const onImageUpdated = (imageId: string) => {
    const dto = { imageUrl: imageId };
    updateFaction(faction.id, dto, auth)
      .then(() => setFaction({ ...faction, imageUrl: imageId }))
      .catch((error: Error) => showError(error.message));
  };

  if (!faction || !game) return <div>Loading...</div>;

  return (
    <>
      <EditableAvatar imageUrl={faction.imageUrl || ''} onImageChange={onImageUpdated} images={getAvatarImages()} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {faction.name}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {faction.description}
      </Typography>
    </>
  );
};

export default FactionViewResume;
