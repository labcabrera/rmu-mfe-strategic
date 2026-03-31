import React, { FC, useState } from 'react';
import { Typography } from '@mui/material';
import { EditableAvatar } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { updateFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { getAvatarImages } from '../../services/image-service';

const FactionViewResume: FC<{
  faction: Faction;
  setFaction: (faction: Faction) => void;
  game: StrategicGame;
}> = ({ faction, setFaction, game }) => {
  const { showError } = useError();

  const onImageUpdated = (imageId: string) => {
    updateFaction(faction.id, { ...faction, imageUrl: imageId })
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
