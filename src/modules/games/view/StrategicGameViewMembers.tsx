import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  approveJoinRequest,
  fetchFriends,
  Friend,
  GAME_MEMBER_ROLES,
  GameMember,
  GameMemberRole,
  Panel,
  removeGameMember,
  removeJoinRequest,
  setGameMember,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { isGameMaster, isGameOwner } from '../../shared/permissions';

/**
 * Members of a strategic game (spec 071, decisions 4 to 6): the masters add friends of the owner as players or
 * spectators (only the owner names co-masters), change their roles and expel them, and approve or reject the join
 * requests of a public game. A member leaves the game.
 */
const StrategicGameViewMembers: FC<{ game: StrategicGame; onChanged: (game: StrategicGame) => void }> = ({
  game,
  onChanged,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const userId = auth.user?.profile?.sub;
  const master = isGameMaster(auth, game);
  const owner = isGameOwner(auth, game);
  const members = game.members ?? [];
  const joinRequests = game.joinRequests ?? [];
  const [friends, setFriends] = useState<Friend[]>();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [role, setRole] = useState<GameMemberRole>('player');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (master) fetchFriends(auth).then(setFriends).catch(notify.error);
  }, [master]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (action: () => Promise<StrategicGame>) => {
    setBusy(true);
    action()
      .then(onChanged)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  // Co-masters are the owner's business.
  const rolesFor = (member?: GameMember) =>
    GAME_MEMBER_ROLES.filter((option) => owner || (option !== 'master' && member?.role !== 'master'));
  const canEdit = (member: GameMember) => master && (owner || member.role !== 'master');
  const available = (friends ?? []).filter((f) => f.userId !== game.owner && !members.some((m) => m.userId === f.userId));

  const leave = () => run(() => removeGameMember(game.id, 'me', auth));
  const add = () => {
    if (!friend) return;
    run(() => setGameMember(game.id, friend.userId, role, auth).then((updated) => (setFriend(null), updated)));
  };

  // Field names outside the JSX: the i18n lint reads strings there as visible text.
  const newRoleName = 'role';
  const friendName = 'friend';

  const roleField = (value: GameMemberRole, onChange: (value: GameMemberRole) => void, name: string, member?: GameMember) => (
    <TextField
      select
      size="small"
      name={name}
      label={t('game-member-role')}
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as GameMemberRole)}
      sx={{ minWidth: 150 }}
    >
      {rolesFor(member).map((option) => (
        <MenuItem key={option} value={option}>
          {t(`game-member-role-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );

  const self = members.find((member) => member.userId === userId);

  return (
    <Panel
      title={t('game-members')}
      extra={
        self && (
          <Button size="small" color="warning" disabled={busy} onClick={leave}>
            {t('leave-game')}
          </Button>
        )
      }
    >
      <Stack spacing={2}>
        {members.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('game-members-none')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {members.map((member) => (
              <ListItem
                key={member.userId}
                disableGutters
                secondaryAction={
                  canEdit(member) && (
                    <Tooltip title={t('game-member-remove')}>
                      <span>
                        <IconButton
                          edge="end"
                          aria-label={t('game-member-remove')}
                          disabled={busy}
                          onClick={() => run(() => removeGameMember(game.id, member.userId, auth))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )
                }
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: '100%', pr: 6 }}>
                  <ListItemText primary={member.userName} />
                  {canEdit(member) ? (
                    roleField(
                      member.role,
                      (value) => run(() => setGameMember(game.id, member.userId, value, auth)),
                      `role-${member.userId}`,
                      member
                    )
                  ) : (
                    <Chip size="small" label={t(`game-member-role-${member.role}`)} />
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
        {master && (
          <>
            <Typography variant="subtitle2">{t('game-member-add')}</Typography>
            {friends !== undefined && available.length === 0 && members.length === 0 ? (
              <Alert severity="info">{t('share-no-friends')}</Alert>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                <Autocomplete
                  size="small"
                  sx={{ flex: 1, minWidth: 200 }}
                  options={available}
                  loading={friends === undefined}
                  value={friend}
                  disabled={busy}
                  onChange={(_e, value) => setFriend(value)}
                  getOptionLabel={(option) => option.userName}
                  isOptionEqualToValue={(option, value) => option.userId === value.userId}
                  renderInput={(params) => <TextField {...params} name={friendName} label={t('share-friend')} />}
                />
                {roleField(role, setRole, newRoleName)}
                <Button variant="contained" onClick={add} disabled={!friend || busy}>
                  {t('add')}
                </Button>
              </Stack>
            )}
            {!owner && (
              <Typography variant="caption" color="text.secondary">
                {t('game-member-add-help')}
              </Typography>
            )}
          </>
        )}
        {master && joinRequests.length > 0 && (
          <>
            <Typography variant="subtitle2">{t('join-requests')}</Typography>
            <List dense disablePadding>
              {joinRequests.map((request) => (
                <ListItem
                  key={request.userId}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t('join-request-approve')}>
                        <span>
                          <IconButton
                            aria-label={t('join-request-approve')}
                            disabled={busy}
                            onClick={() => run(() => approveJoinRequest(game.id, request.userId, auth))}
                          >
                            <CheckIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={t('join-request-reject')}>
                        <span>
                          <IconButton
                            edge="end"
                            aria-label={t('join-request-reject')}
                            disabled={busy}
                            onClick={() => run(() => removeJoinRequest(game.id, request.userId, auth))}
                          >
                            <CloseIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemText primary={request.userName} secondary={request.message} sx={{ pr: 10 }} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Stack>
    </Panel>
  );
};

export default StrategicGameViewMembers;
