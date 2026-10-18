import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Typography } from '@mui/material';
import { EditableAvatar, Faction, StrategicGame, updateFaction, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

export default function FactionViewResume({
  faction,
  setFaction,
  game,
}: {
  game?: StrategicGame;
  faction?: Faction;
  setFaction: (faction: Faction) => void;
}) {
  const auth = useAuth();
  const notify = useNotify();

  const onImageUpdated = (imageId: string) => {
    if (!faction) return;
    const dto = { imageUrl: imageId };
    updateFaction(faction.id, dto, auth)
      .then(() => setFaction({ ...faction, imageUrl: imageId }))
      .catch((error: Error) => notify.error(error));
  };

  return (
    <>
      <EditableAvatar imageUrl={faction?.imageUrl || ''} onImageChange={onImageUpdated} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {faction?.name}
      </Typography>
      <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
        {game?.name}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {faction?.description}
      </Typography>
    </>
  );
}
