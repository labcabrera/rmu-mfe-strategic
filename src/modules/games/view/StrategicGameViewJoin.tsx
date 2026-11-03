import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Stack, TextField } from '@mui/material';
import {
  fetchGameMembers,
  GameJoinRequest,
  Panel,
  removeJoinRequest,
  requestJoinGame,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const MAX_MESSAGE = 500;

/**
 * A public game seen by a user who is not a member (spec 071, decisions 4 and 13): only its cover, and a request to
 * join it that a master approves or rejects. The user sees their pending request and can take it back.
 */
const StrategicGameViewJoin: FC<{ game: StrategicGame }> = ({ game }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const [request, setRequest] = useState<GameJoinRequest | null>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchGameMembers(game.id, auth)
      .then((data) => setRequest(data.joinRequests?.[0] ?? null))
      // Without a request the API answers 403: nothing to show.
      .catch(() => setRequest(null));
  }, [game.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    setBusy(true);
    requestJoinGame(game.id, message.trim() || undefined, auth)
      .then(() => {
        notify.success(t('join-request-sent'));
        setRequest({ userId: auth.user?.profile?.sub ?? '', userName: '', message, requestedAt: new Date().toISOString() });
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  const withdraw = () => {
    setBusy(true);
    removeJoinRequest(game.id, 'me', auth)
      .then(() => setRequest(null))
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  // The field name outside the JSX: the i18n lint reads strings there as visible text.
  const messageName = 'message';

  return (
    <Panel title={t('join-game')}>
      {request === undefined ? null : request ? (
        <Stack spacing={1}>
          <Alert severity="info">{t('join-request-pending')}</Alert>
          <Button sx={{ alignSelf: 'flex-start' }} disabled={busy} onClick={withdraw}>
            {t('join-request-withdraw')}
          </Button>
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Alert severity="info">{t('join-game-help')}</Alert>
          <TextField
            name={messageName}
            label={t('join-request-message')}
            value={message}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: MAX_MESSAGE } }}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} disabled={busy} onClick={send}>
            {t('join-request-send')}
          </Button>
        </Stack>
      )}
    </Panel>
  );
};

export default StrategicGameViewJoin;
