/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Stack, Typography } from '@mui/material';
import {
  Breadcrumb,
  CancelButton,
  fetchStrategicGames,
  LayoutBase,
  StrategicGame,
  StrategicGamePicker,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Shown by the creation pages that need a strategic game when they are opened without a gameId. */
const StrategicGameRequired: FC<{
  breadcrumbs: Breadcrumb[];
  message?: string;
  onSelect: (gameId: string) => void;
  onCancel: () => void;
}> = ({ breadcrumbs, message, onSelect, onCancel }) => {
  const auth = useAuth();
  const notify = useNotify();
  const [games, setGames] = useState<StrategicGame[]>();

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setGames(response.content))
      .catch(notify.error);
  }, []);

  return (
    <LayoutBase breadcrumbs={breadcrumbs} actions={[<CancelButton key="cancel" onClick={onCancel} />]}>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        {message && <Typography>{message}</Typography>}
        <StrategicGamePicker games={games} value={null} onChange={(id) => id && onSelect(id)} required error />
      </Stack>
    </LayoutBase>
  );
};

export default StrategicGameRequired;
