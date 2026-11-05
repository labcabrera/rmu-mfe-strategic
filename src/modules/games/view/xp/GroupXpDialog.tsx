/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Checkbox, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  awardGroupXp,
  Character,
  DataTable,
  EmptyState,
  fetchCharacters,
  GroupXpResult,
  LoadingState,
  NumericInput,
  RmuDialog,
  SectionLabel,
  StrategicGame,
  XP_EVENT_TYPES,
  XpEventType,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

/** At most this experience at a time, as the API. */
const MAX_GROUP_XP = 100000;

/**
 * Experience for the group (workspace spec 079, E, Core Law §12.4): the game master gives the whole amount to each
 * chosen character (every live one by default), not a share. The experience multiplier of the game is not applied.
 */
const GroupXpDialog: FC<{ game: StrategicGame; open: boolean; onClose: () => void }> = ({ game, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [characters, setCharacters] = useState<Character[]>();
  const [xp, setXp] = useState<number>();
  const [eventType, setEventType] = useState<XpEventType | ''>('');
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<GroupXpResult>();
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setXp(undefined);
    setEventType('');
    setExcluded(new Set());
    setDone(undefined);
    setCharacters(undefined);
    fetchCharacters(`gameId==${game.id}`, 0, 100, auth)
      .then((page) =>
        setCharacters(page.content.filter((c) => c.status !== 'dead').sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(notify.error);
  }, [open, game.id]);

  const chosen = useMemo(() => (characters ?? []).filter((c) => !excluded.has(c.id)), [characters, excluded]);
  const toggle = (id: string) =>
    setExcluded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirm = () => {
    if (!xp) return;
    setWorking(true);
    awardGroupXp(game.id, { xp, characterIds: chosen.map((c) => c.id), ...(eventType ? { eventType } : {}) }, auth)
      .then((result) => {
        setDone(result);
        notify.success(t('group-xp-done', { xp: result.xp, count: result.characters.filter((c) => !c.error).length }));
      })
      .catch(notify.error)
      .finally(() => setWorking(false));
  };

  const failed = done?.characters.filter((c) => c.error) ?? [];

  return (
    <RmuDialog
      open={open}
      title={t('group-xp')}
      subtitle={game.name}
      maxWidth="sm"
      onCancel={done ? undefined : onClose}
      onClose={done ? onClose : undefined}
      onConfirm={done ? undefined : confirm}
      onConfirmDisabled={working || !xp || chosen.length === 0}
    >
      {done ? (
        <Stack spacing={2} sx={{ pt: 1 }}>
          {failed.length > 0 && <Alert severity="warning">{t('group-xp-partial', { count: failed.length })}</Alert>}
          <DataTable
            rows={done.characters}
            getKey={(entry) => entry.characterId}
            columns={[
              { key: 'character', header: t('character'), render: (entry) => entry.name },
              {
                key: 'xp',
                header: t('xp'),
                render: (entry) =>
                  entry.error ? (
                    <Typography variant="body2" color="error">
                      {t(entry.error.code)}
                    </Typography>
                  ) : (
                    `${entry.xpBefore} → ${entry.xpAfter}`
                  ),
              },
              {
                key: 'level',
                header: t('level'),
                render: (entry) =>
                  entry.error
                    ? '—'
                    : entry.availableLevel !== undefined && entry.availableLevel > (entry.level ?? 0)
                      ? t('group-xp-level-up', { level: entry.level, available: entry.availableLevel })
                      : entry.level,
              },
            ]}
          />
        </Stack>
      ) : !characters ? (
        <LoadingState />
      ) : (
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <NumericInput
                integer
                min={1}
                max={MAX_GROUP_XP}
                allowNegatives={false}
                label={t('xp')}
                value={xp ?? null}
                onChange={(value) => setXp(value ? Math.min(MAX_GROUP_XP, value) : undefined)}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label={t('group-xp-event-type')}
                value={eventType}
                onChange={(e) => setEventType(e.target.value as XpEventType | '')}
                fullWidth
              >
                <MenuItem value="">{t('group-xp-event-none')}</MenuItem>
                {XP_EVENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`group-xp-event-${type}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary">
            {t('group-xp-help')}
          </Typography>
          {characters.length === 0 ? (
            <EmptyState dense title={t('group-xp-no-characters')} />
          ) : (
            <>
              <SectionLabel>{t('group-xp-characters', { count: chosen.length })}</SectionLabel>
              <DataTable
                rows={characters}
                getKey={(character) => character.id}
                columns={[
                  {
                    key: 'chosen',
                    header: '',
                    render: (character) => (
                      <Checkbox
                        size="small"
                        checked={!excluded.has(character.id)}
                        onChange={() => toggle(character.id)}
                        slotProps={{ input: { 'aria-label': character.name } }}
                      />
                    ),
                  },
                  { key: 'character', header: t('character'), render: (character) => character.name },
                  { key: 'level', header: t('level'), render: (character) => character.experience.level },
                  { key: 'xp', header: t('xp'), render: (character) => character.experience.xp },
                ]}
              />
            </>
          )}
        </Stack>
      )}
    </RmuDialog>
  );
};

export default GroupXpDialog;
