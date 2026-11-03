import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  addFactionPlayer,
  approveJoinRequest,
  EntityAvatar,
  Faction,
  fetchFriends,
  Friend,
  GAME_MEMBER_ROLES,
  GameMember,
  GameMemberRole,
  removeFactionPlayer,
  removeGameMember,
  removeJoinRequest,
  setGameMember,
  StrategicGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { isGameMaster, isGameOwner } from '../../../shared/permissions';

/**
 * Members of a strategic game (spec 072, decision 14), grouped by role: the masters change roles, expel, add friends of
 * the owner, answer join requests and give each player its factions. Anybody else reads it and can leave the game.
 */
/**
 * Columns of a member row, shared with the row that adds one, so that the roles line up whatever the length of the
 * names: avatar, name (cut with an ellipsis), role and the remove / add button.
 */
const rowSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '36px minmax(0, 1fr) 130px 72px', sm: '36px minmax(0, 1fr) 160px 88px' },
  columnGap: 1.5,
  rowGap: 1,
  alignItems: 'center',
} as const;

const StrategicGameMembersDialog: FC<{
  open: boolean;
  game: StrategicGame;
  factions: Faction[] | undefined;
  onClose: () => void;
  onChanged: (game: StrategicGame) => void;
  onFactionChanged: (faction: Faction) => void;
}> = ({ open, game, factions, onClose, onChanged, onFactionChanged }) => {
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
    if (open && master && friends === undefined) fetchFriends(auth).then(setFriends).catch(notify.error);
  }, [open, master]); // eslint-disable-line react-hooks/exhaustive-deps

  const runGame = (action: () => Promise<StrategicGame>) => {
    setBusy(true);
    action()
      .then(onChanged)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  // Masters are the owner's business (spec 071).
  const rolesFor = (member?: GameMember) =>
    GAME_MEMBER_ROLES.filter((option) => owner || (option !== 'master' && member?.role !== 'master'));
  const canEdit = (member: GameMember) => master && (owner || member.role !== 'master');
  const available = (friends ?? []).filter(
    (f) => f.userId !== game.owner && !members.some((m) => m.userId === f.userId)
  );
  const factionsOf = (member: GameMember) => (factions ?? []).filter((f) => f.players?.includes(member.userId));

  // The factions of a player: add and remove the difference, one call per faction.
  const setFactionsOf = (member: GameMember, selected: Faction[]) => {
    const current = factionsOf(member);
    const added = selected.filter((f) => !current.some((c) => c.id === f.id));
    const removed = current.filter((c) => !selected.some((f) => f.id === c.id));
    setBusy(true);
    Promise.all([
      ...added.map((f) => addFactionPlayer(f.id, member.userId, auth)),
      ...removed.map((f) => removeFactionPlayer(f.id, member.userId, auth)),
    ])
      .then((updated) => updated.forEach(onFactionChanged))
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  const add = () => {
    if (!friend) return;
    runGame(() => setGameMember(game.id, friend.userId, role, auth).then((updated) => (setFriend(null), updated)));
  };

  // Field names outside the JSX: the i18n lint reads strings there as visible text.
  const newRoleName = 'role';
  const friendName = 'friend';
  const factionsName = 'factions';

  const roleField = (
    value: GameMemberRole,
    onChange: (value: GameMemberRole) => void,
    name: string,
    member?: GameMember
  ) => (
    <TextField
      select
      size="small"
      name={name}
      label={t('game-member-role')}
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as GameMemberRole)}
      fullWidth
    >
      {rolesFor(member).map((option) => (
        <MenuItem key={option} value={option}>
          {t(`game-member-role-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );

  const memberRow = (member: GameMember) => {
    const memberFactions = factionsOf(member);
    return (
      <Box key={member.userId} sx={{ ...rowSx, py: 1 }}>
        <EntityAvatar name={member.userName} size={36} />
        <Tooltip title={member.userName}>
          <Typography
            variant="body2"
            noWrap
            sx={{ minWidth: 0, fontWeight: member.userId === userId ? 600 : undefined }}
          >
            {member.userName}
          </Typography>
        </Tooltip>
        <Box sx={{ minWidth: 0 }}>
          {canEdit(member) ? (
            roleField(
              member.role,
              (value) => runGame(() => setGameMember(game.id, member.userId, value, auth)),
              `role-${member.userId}`,
              member
            )
          ) : (
            <Chip size="small" variant="outlined" label={t(`game-member-role-${member.role}`)} />
          )}
        </Box>
        <Box sx={{ justifySelf: 'end' }}>
          {canEdit(member) && (
            <Tooltip title={t('game-member-remove')}>
              <span>
                <IconButton
                  aria-label={t('game-member-remove')}
                  disabled={busy}
                  onClick={() => runGame(() => removeGameMember(game.id, member.userId, auth))}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
        {member.role === 'player' && (
          // The factions of a player, under its name and role
          <Box sx={{ gridColumn: '2 / -1', minWidth: 0 }}>
            {master ? (
              <Autocomplete
                multiple
                size="small"
                options={factions ?? []}
                value={memberFactions}
                disabled={busy || factions === undefined}
                onChange={(_e, value) => setFactionsOf(member, value)}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={t('no-factions-have-been-created')}
                renderInput={(params) => (
                  <TextField {...params} name={`${factionsName}-${member.userId}`} label={t('factions')} />
                )}
              />
            ) : (
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {memberFactions.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    {t('game-member-no-factions')}
                  </Typography>
                ) : (
                  memberFactions.map((f) => <Chip key={f.id} size="small" label={f.name} />)
                )}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    );
  };

  const groups: { role: GameMemberRole; title: string }[] = [
    { role: 'master', title: t('game-members-masters') },
    { role: 'player', title: t('game-members-players') },
    { role: 'spectator', title: t('game-members-spectators') },
  ];
  const self = members.find((member) => member.userId === userId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('game-members')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {members.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('game-members-none')}
            </Typography>
          )}
          {groups.map(({ role: groupRole, title }) => {
            const group = members.filter((member) => member.role === groupRole);
            if (group.length === 0) return null;
            return (
              <div key={groupRole}>
                <Typography variant="overline" color="text.secondary">
                  {`${title} (${group.length})`}
                </Typography>
                <Stack divider={<Divider flexItem />}>{group.map(memberRow)}</Stack>
              </div>
            );
          })}
          {master && (
            <>
              <Divider />
              <Typography variant="subtitle2">{t('game-member-add')}</Typography>
              {friends !== undefined && available.length === 0 ? (
                <Alert severity="info">{t('share-no-friends')}</Alert>
              ) : (
                <Box sx={rowSx}>
                  <Autocomplete
                    size="small"
                    sx={{ gridColumn: '1 / 3', minWidth: 0 }}
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
                  <Button variant="contained" onClick={add} disabled={!friend || busy} sx={{ justifySelf: 'end' }}>
                    {t('add')}
                  </Button>
                </Box>
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
              <Divider />
              <Typography variant="subtitle2">{t('join-requests')}</Typography>
              {joinRequests.map((request) => (
                <Stack key={request.userId} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <EntityAvatar name={request.userName} size={32} />
                  <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2">{request.userName}</Typography>
                    {request.message && (
                      <Typography variant="caption" color="text.secondary">
                        {request.message}
                      </Typography>
                    )}
                  </Stack>
                  <Tooltip title={t('join-request-approve')}>
                    <span>
                      <IconButton
                        aria-label={t('join-request-approve')}
                        disabled={busy}
                        onClick={() => runGame(() => approveJoinRequest(game.id, request.userId, auth))}
                      >
                        <CheckIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('join-request-reject')}>
                    <span>
                      <IconButton
                        aria-label={t('join-request-reject')}
                        disabled={busy}
                        onClick={() => runGame(() => removeJoinRequest(game.id, request.userId, auth))}
                      >
                        <CloseIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {self && (
          <Button color="warning" disabled={busy} onClick={() => runGame(() => removeGameMember(game.id, 'me', auth))}>
            {t('leave-game')}
          </Button>
        )}
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StrategicGameMembersDialog;
