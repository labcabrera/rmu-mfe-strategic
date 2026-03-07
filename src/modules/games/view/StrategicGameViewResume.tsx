import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import EditableAvatar from '../../shared/avatars/EditableAvatar';

const defaultGameImage = `${imageBaseUrl}images/generic/strategic.png`;

const StrategicGameViewResume: FC<{
  strategicGame: StrategicGame;
  setStrategicGame: Dispatch<SetStateAction<StrategicGame>>;
}> = ({ strategicGame, setStrategicGame: setGame }) => {
  const { showError } = useError();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const onImageUpdated = (imageId: string) => {
    console.log(`Image selected: ${imageId}`);
    updateStrategicGame(strategicGame.id, { ...strategicGame, imageUrl: imageId })
      .then(() => setGame({ ...strategicGame, imageUrl: imageId }))
      .catch((error: Error) => showError(error.message));
  };

  return (
    <>
      <EditableAvatar
        imageUrl={strategicGame.imageUrl || defaultGameImage}
        onImageChange={onImageUpdated}
        variant="circular"
      />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {t(strategicGame.name)}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to={`/core/realms/view/${strategicGame.realmId}`}
        >
          {strategicGame.realmName}
        </Link>
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {strategicGame.description}
      </Typography>
    </>
  );
};

export default StrategicGameViewResume;
