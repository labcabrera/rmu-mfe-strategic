import { FC, useState } from 'react';
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
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBusyAction } from '../../shared/useBusyAction';

const MAX_MESSAGE = 500;

/**
 * A public game seen by a user who is not a member (spec 071, decisions 4 and 13): only its cover, and a request to
 * join it that a master approves or rejects. The user sees their pending request and can take it back.
 */
const StrategicGameViewJoin: FC<{ game: StrategicGame }> = ({ game }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const { busy, run } = useBusyAction();

  const requestKey = ['game-join-request', game.id];
  const query = useQuery({
    queryKey: requestKey,
    queryFn: () =>
      fetchGameMembers(game.id, auth)
        .then((data) => data.joinRequests?.[0] ?? null)
        // Without a request the API answers 403: nothing to show.
        .catch(() => null),
    gcTime: 0,
    placeholderData: keepPreviousData,
  });
  const request = query.data;
  const setRequest = (value: GameJoinRequest | null) => queryClient.setQueryData(requestKey, value);

  const send = () => {
    run(requestJoinGame(game.id, message.trim() || undefined, auth), () => {
      notify.success(t('join-request-sent'));
      setRequest({
        userId: auth.user?.profile?.sub ?? '',
        userName: '',
        message,
        requestedAt: new Date().toISOString(),
      });
    });
  };

  const withdraw = () => {
    run(removeJoinRequest(game.id, 'me', auth), () => setRequest(null));
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
