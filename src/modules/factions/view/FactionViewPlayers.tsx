import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Autocomplete, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import {
  addFactionPlayer,
  canManageStrategic,
  canWriteStrategic,
  Faction,
  fetchFriends,
  Panel,
  removeFactionPlayer,
  span,
  StrategicGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';

interface Candidate {
  userId: string;
  userName: string;
}

/**
 * The players of a faction (spec 072, decision 5): they change the faction and what hangs from it. The masters add any
 * player of the game and take anybody out; its players add their friends (who join the game) and leave it.
 */
const FactionViewPlayers: FC<{
  faction: Faction;
  game: StrategicGame | undefined;
  onChanged: (faction: Faction) => void;
}> = ({ faction, game, onChanged }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const userId = auth.user?.profile?.sub;
  const master = canManageStrategic(faction);
  const player = !master && canWriteStrategic(faction);
  const players = faction.players ?? [];
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [busy, setBusy] = useState(false);

  const friendsQuery = useQuery({
    queryKey: ['friends'],
    queryFn: () => fetchFriends(auth),
    enabled: player,
    gcTime: 0,
  });
  const friends = friendsQuery.data;

  useEffect(() => {
    if (friendsQuery.error) notify.error(friendsQuery.error);
  }, [friendsQuery.error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Masters choose among the players of the game; a player of the faction among their friends.
  const candidates = useMemo<Candidate[]>(() => {
    const source: Candidate[] = master
      ? (game?.members ?? []).filter((member) => member.role === 'player')
      : (friends ?? []).filter((friend) => friend.userId !== game?.owner);
    return source.filter((c) => !players.includes(c.userId));
  }, [master, game, friends, players]);

  const run = (action: () => Promise<Faction>) => {
    setBusy(true);
    action()
      .then(onChanged)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };
  const add = () => {
    if (!candidate) return;
    run(() => addFactionPlayer(faction.id, candidate.userId, auth).then((updated) => (setCandidate(null), updated)));
  };
  const name = (id: string) => faction.playerNames?.[id] ?? id;

  // Field name outside the JSX: the i18n lint reads strings there as visible text.
  const fieldName = 'player';

  return (
    <Box sx={span(12, 12)}>
      <Panel
        title={t('faction-players')}
        extra={
          userId &&
          players.includes(userId) && (
            <Button
              size="small"
              color="warning"
              disabled={busy}
              onClick={() => run(() => removeFactionPlayer(faction.id, 'me', auth))}
            >
              {t('leave-faction')}
            </Button>
          )
        }
      >
        <Stack spacing={2}>
          {players.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('faction-players-none')}
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {players.map((id) => (
                <Chip
                  key={id}
                  label={name(id)}
                  color={id === userId ? 'primary' : 'default'}
                  variant={id === userId ? 'filled' : 'outlined'}
                  onDelete={master ? () => run(() => removeFactionPlayer(faction.id, id, auth)) : undefined}
                  disabled={busy}
                />
              ))}
            </Stack>
          )}
          {(master || player) && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
              <Autocomplete
                size="small"
                sx={{ flex: 1, minWidth: 220 }}
                options={candidates}
                loading={player && friends === undefined}
                value={candidate}
                disabled={busy}
                onChange={(_e, value) => setCandidate(value)}
                getOptionLabel={(option) => option.userName}
                isOptionEqualToValue={(option, value) => option.userId === value.userId}
                noOptionsText={t(master ? 'faction-players-no-candidates' : 'share-no-friends')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name={fieldName}
                    label={t(master ? 'game-member-role-player' : 'share-friend')}
                  />
                )}
              />
              <Button variant="contained" onClick={add} disabled={!candidate || busy}>
                {t('add')}
              </Button>
            </Stack>
          )}
          {(master || player) && (
            <Typography variant="caption" color="text.secondary">
              {t(master ? 'faction-players-help-master' : 'faction-players-help-player')}
            </Typography>
          )}
        </Stack>
      </Panel>
    </Box>
  );
};

export default FactionViewPlayers;
