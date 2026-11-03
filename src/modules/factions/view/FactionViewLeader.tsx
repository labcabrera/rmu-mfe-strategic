import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { Faction, Panel, span, StrategicGame, updateFaction, useNotify } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * The leader of a faction (spec 071, decision 9): a player of the game who spends its gold and buys for it. The
 * masters choose them among the players and co-masters of the game.
 */
const FactionViewLeader: FC<{
  faction: Faction;
  game: StrategicGame | undefined;
  canEdit: boolean;
  onChanged: (faction: Faction) => void;
}> = ({ faction, game, canEdit, onChanged }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const [saving, setSaving] = useState(false);
  const candidates = (game?.members ?? []).filter((member) => member.role === 'player' || member.role === 'master');
  const leaderName = game?.members?.find((member) => member.userId === faction.leaderId)?.userName;

  const onSelect = (leaderId: string) => {
    setSaving(true);
    updateFaction(faction.id, { leaderId: leaderId || null }, auth)
      .then(onChanged)
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  return (
    <Box sx={span(12, 12)}>
      <Panel title={t('faction-leader')}>
        {canEdit ? (
          <TextField
            select
            size="small"
            label={t('faction-leader')}
            helperText={t('faction-leader-help')}
            value={faction.leaderId ?? ''}
            disabled={saving}
            onChange={(e) => onSelect(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">{t('no-faction-leader')}</MenuItem>
            {candidates.map((member) => (
              <MenuItem key={member.userId} value={member.userId}>
                {member.userName}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {faction.leaderId ? (leaderName ?? faction.leaderId) : t('no-faction-leader')}
          </Typography>
        )}
      </Panel>
    </Box>
  );
};

export default FactionViewLeader;
