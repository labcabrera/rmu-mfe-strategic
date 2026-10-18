/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import {
  Breadcrumb,
  CancelButton,
  fetchStrategicGames,
  LayoutBase,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** Shown by the creation pages that need a strategic game when they are opened without a gameId. */
const StrategicGamePicker: FC<{
  breadcrumbs: Breadcrumb[];
  message?: string;
  onSelect: (gameId: string) => void;
  onCancel: () => void;
}> = ({ breadcrumbs, message, onSelect, onCancel }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [games, setGames] = useState<StrategicGame[]>([]);

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setGames(response.content))
      .catch(notify.error);
  }, []);

  return (
    <LayoutBase breadcrumbs={breadcrumbs} actions={[<CancelButton key="cancel" onClick={onCancel} />]}>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        {message && <Typography>{message}</Typography>}
        <Autocomplete
          options={games}
          getOptionLabel={(game) => game.name}
          onChange={(_, game) => game && onSelect(game.id)}
          renderInput={(params) => <TextField {...params} label={t('strategic-game')} error />}
          noOptionsText={t('no-options')}
        />
      </Stack>
    </LayoutBase>
  );
};

export default StrategicGamePicker;
