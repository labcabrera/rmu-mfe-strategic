import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { getGenericImages } from '../../services/image-service';
import StrategicGameAvatar from '../../shared/avatars/StrategicGameAvatar';
import ImageSelectorDialog from '../../shared/images/ImageSelectorDialog';

const StrategicGameViewResume: FC<{ game: StrategicGame; setGame: Dispatch<SetStateAction<StrategicGame>> }> = ({
  game,
  setGame,
}) => {
  const location = useLocation();
  const { showError } = useError();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const onImageUpdated = (imageId: string) => {
    console.log(`Image selected: ${imageId}`);
    updateStrategicGame(game.id, { ...game, imageUrl: imageId })
      .then(() => {
        setGame({ ...game, imageUrl: imageId });
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  if (!game) return <div>Loading...</div>;

  return (
    <>
      <StrategicGameAvatar strategicGame={game} size={300} onClick={() => setImageDialogOpen(true)} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {t(game.name)}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        {t(game.realmName)}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {game.description}
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

export default StrategicGameViewResume;
