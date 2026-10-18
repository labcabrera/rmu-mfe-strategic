import React, { FC } from 'react';
import { useAuth } from 'react-oidc-context';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import {
  EditableAvatar,
  imageBaseUrl,
  StrategicGame,
  updateStrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const defaultGameImage = `${imageBaseUrl}images/generic/strategic.png`;

const StrategicGameViewResume: FC<{
  strategicGame?: StrategicGame;
  setStrategicGame: (strategicGame: StrategicGame) => void;
}> = ({ strategicGame, setStrategicGame: setGame }) => {
  const auth = useAuth();
  const notify = useNotify();

  const onImageUpdated = (imageId: string) => {
    if (!strategicGame) return;
    const dto = { imageUrl: imageId };
    updateStrategicGame(strategicGame.id, dto, auth)
      .then(() => setGame({ ...strategicGame, imageUrl: imageId }))
      .catch((error: Error) => notify.error(error));
  };

  return (
    <>
      <EditableAvatar imageUrl={strategicGame?.imageUrl || defaultGameImage} onImageChange={onImageUpdated} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {strategicGame?.name || ''}
      </Typography>

      <Typography variant="body1" sx={{ mt: 2 }}>
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to={`/core/realms/view/${strategicGame?.realmId}`}
        >
          {strategicGame?.realmName}
        </Link>
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {strategicGame?.description}
      </Typography>
    </>
  );
};

export default StrategicGameViewResume;
