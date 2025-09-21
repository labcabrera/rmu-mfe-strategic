import React, { FC, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { updateFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { getGenericImages } from '../../services/image-service';
import FactionAvatar from '../../shared/avatars/FactionAvatar';
import ImageSelectorDialog from '../../shared/images/ImageSelectorDialog';

const FactionViewResume: FC<{
  faction: Faction;
  setFaction: (faction: Faction) => void;
  game: StrategicGame;
}> = ({ faction, setFaction, game }) => {
  const { showError } = useError();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const onImageUpdated = (imageId: string) => {
    console.log(`Image selected: ${imageId}`);
    updateFaction(faction.id, { ...faction, imageUrl: imageId })
      .then(() => {
        setFaction({ ...faction, imageUrl: imageId });
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  if (!faction || !game) return <div>Loading...</div>;

  return (
    <>
      <FactionAvatar faction={faction} size={200} onClick={() => setImageDialogOpen(true)} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {faction.name}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        <Link component={RouterLink} color="inherit" to={`/strategic/games/view/${game.id}`}>
          {game.name}
        </Link>
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {faction.description}
      </Typography>
      <ImageSelectorDialog
        open={imageDialogOpen}
        images={getGenericImages()}
        onClose={() => setImageDialogOpen(false)}
        onSelect={onImageUpdated}
      />
    </>
  );
};

export default FactionViewResume;
