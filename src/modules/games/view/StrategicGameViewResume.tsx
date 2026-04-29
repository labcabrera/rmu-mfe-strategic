import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import { EditableAvatar, StrategicGame, updateStrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { getAvatarImages } from '../../services/image-service';

const defaultGameImage = `${imageBaseUrl}images/generic/strategic.png`;

const StrategicGameViewResume: FC<{
  strategicGame: StrategicGame;
  setStrategicGame: Dispatch<SetStateAction<StrategicGame>>;
}> = ({ strategicGame, setStrategicGame: setGame }) => {
  const auth = useAuth();
  const { showError } = useError();

  const onImageUpdated = (imageId: string) => {
    const dto = { imageUrl: imageId };
    updateStrategicGame(strategicGame.id, dto, auth)
      .then(() => setGame({ ...strategicGame, imageUrl: imageId }))
      .catch((error: Error) => showError(error.message));
  };

  return (
    <>
      <EditableAvatar
        imageUrl={strategicGame.imageUrl || defaultGameImage}
        onImageChange={onImageUpdated}
        images={getAvatarImages()}
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
