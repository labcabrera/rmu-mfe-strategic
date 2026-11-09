/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  Character,
  DataTable,
  EmptyState,
  fetchCharacters,
  fetchFullPage,
  formatCampaignDate,
  formatElapsedTime,
  GameTimeLogCharacter,
  isApiError,
  LoadingState,
  MAX_PASS_TIME_DAYS,
  NumericInput,
  PASS_TIME_ACTIVITIES,
  passTime,
  PassTimeActivity,
  PassTimeResult,
  RmuDialog,
  SectionLabel,
  StrategicGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHealingTables } from '../../../api/healing-tables';
import RestDialog from '../../../characters/view/health/RestDialog';
import PassTimeResults from './PassTimeResults';

const HOURS_PER_DAY = 24;
const MAX_HOURS = HOURS_PER_DAY - 1;
const DEFAULT_ACTIVITY: PassTimeActivity = 'rest';
const SHORTCUTS: { key: string; days: number; hours: number }[] = [
  { key: 'pass-time-shortcut-hour', days: 0, hours: 1 },
  { key: 'pass-time-shortcut-night', days: 0, hours: 8 },
  { key: 'pass-time-shortcut-day', days: 1, hours: 0 },
  { key: 'pass-time-shortcut-week', days: 7, hours: 0 },
];

/**
 * Time passes in the campaign (spec 065): days and hours, the activity of every character, a preview calculated by
 * the API without storing anything, and a summary. Characters that failed can rest alone with the dialog of one
 * character, which does not move the calendar.
 */
const PassTimeDialog: FC<{
  game: StrategicGame;
  open: boolean;
  onClose: () => void;
  /** The game with its new calendar */
  onPassed: (game: StrategicGame) => void;
  /** A 409: the game changed meanwhile and has to be read again */
  onConflict: () => void;
}> = ({ game, open, onClose, onPassed, onConflict }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const tables = useHealingTables();
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(8);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState<Record<string, PassTimeActivity>>({});
  const [preview, setPreview] = useState<PassTimeResult>();
  const [done, setDone] = useState<PassTimeResult>();
  const [working, setWorking] = useState(false);
  const [retry, setRetry] = useState<{ character: Character; entry: GameTimeLogCharacter }>();

  useEffect(() => {
    if (!open) return;
    setDays(0);
    setHours(8);
    setNote('');
    setActivities({});
    setPreview(undefined);
    setDone(undefined);
  }, [open, game.id]);

  const queryClient = useQueryClient();
  const charactersKey = ['pass-time-characters', game.id, open];
  const charactersQuery = useQuery({
    // With `open` in the key each opening starts empty and reads them again
    queryKey: charactersKey,
    queryFn: () =>
      fetchFullPage((rsql, page, size) => fetchCharacters(rsql, page, size, auth), `gameId==${game.id}`).then((page) =>
        [...page.content].sort((a, b) => a.name.localeCompare(b.name))
      ),
    enabled: open,
    gcTime: 0,
  });
  const characters = charactersQuery.data;

  useEffect(() => {
    if (charactersQuery.error) notify.error(charactersQuery.error);
  }, [charactersQuery.error]);

  // Any change of the inputs makes the preview stale
  useEffect(() => setPreview(undefined), [days, hours, activities]);

  const alive = useMemo(() => (characters ?? []).filter((c) => c.status !== 'dead'), [characters]);
  const activityOf = (characterId: string) => activities[characterId] ?? DEFAULT_ACTIVITY;
  const affected = alive.filter((c) => activityOf(c.id) !== 'excluded').length;
  const noTime = days + hours === 0;
  const elapsed = formatElapsedTime(days, hours, t);

  const request = (dryRun: boolean) => ({
    days,
    hours,
    note: note.trim() || undefined,
    characters: alive.map((c) => ({ characterId: c.id, activity: activityOf(c.id) })),
    dryRun,
    version: game.version ?? 0,
  });

  const handleError = (error: unknown) => {
    if (isApiError(error) && error.status === 409) {
      notify.error(error);
      onConflict();
      onClose();
      return;
    }
    notify.error(error);
  };

  const runPreview = () => {
    setWorking(true);
    passTime(game.id, request(true), auth)
      .then(setPreview)
      .catch(handleError)
      .finally(() => setWorking(false));
  };

  const confirm = () => {
    setWorking(true);
    passTime(game.id, request(false), auth)
      .then((result) => {
        setDone(result);
        onPassed(result.game);
        notify.success(t('pass-time-done', { day: result.toDay }));
      })
      .catch(handleError)
      .finally(() => setWorking(false));
  };

  const setAll = (activity: PassTimeActivity) =>
    setActivities(Object.fromEntries(alive.map((c) => [c.id, activity])) as Record<string, PassTimeActivity>);

  const shortcut = (value: { days: number; hours: number }) => {
    setDays(value.days);
    setHours(value.hours);
  };

  const consumption = (
    <Alert severity="info">{t('pass-time-consumption-notice', { count: affected, time: elapsed || '—' })}</Alert>
  );

  const failed = done?.characters.filter((c) => c.error) ?? [];
  const retryInitial = retry
    ? {
        hours: done?.hours ?? 0,
        days: done?.days ?? 0,
        fullRest: retry.entry.activity === 'full-rest',
        active: retry.entry.activity === 'active',
      }
    : undefined;

  return (
    <>
      <RmuDialog
        open={open}
        title={t('pass-time')}
        subtitle={`${game.name} · ${formatCampaignDate(done?.game.calendar ?? game.calendar, t)}`}
        maxWidth="md"
        onCancel={done ? undefined : onClose}
        onClose={done ? onClose : undefined}
        onConfirm={done ? undefined : confirm}
        onConfirmDisabled={working || noTime || !characters}
        buttons={
          !done && (
            <Button onClick={runPreview} disabled={working || noTime || !characters}>
              {t('pass-time-preview')}
            </Button>
          )
        }
      >
        {done ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body1">
              {t('pass-time-summary', {
                from: done.fromDay,
                to: done.toDay,
                time: formatElapsedTime(done.days, done.hours, t),
              })}
            </Typography>
            {failed.length > 0 && <Alert severity="warning">{t('pass-time-partial', { count: failed.length })}</Alert>}
            {consumption}
            <PassTimeResults
              results={done.characters}
              characters={characters}
              onRetry={(character, entry) => setRetry({ character, entry })}
            />
          </Stack>
        ) : !characters ? (
          <LoadingState />
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <NumericInput
                  integer
                  min={0}
                  max={MAX_PASS_TIME_DAYS}
                  allowNegatives={false}
                  label={t('days')}
                  value={days}
                  onChange={(value) => setDays(Math.min(MAX_PASS_TIME_DAYS, value ?? 0))}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <NumericInput
                  integer
                  min={0}
                  max={MAX_HOURS}
                  allowNegatives={false}
                  label={t('hours')}
                  value={hours}
                  onChange={(value) => setHours(Math.min(MAX_HOURS, value ?? 0))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', alignItems: 'center', height: '100%' }}
                >
                  {SHORTCUTS.map((s) => (
                    <Button key={s.key} size="small" variant="outlined" onClick={() => shortcut(s)}>
                      {t(s.key)}
                    </Button>
                  ))}
                </Stack>
              </Grid>
              <Grid size={12}>
                <TextField
                  label={t('pass-time-note')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  fullWidth
                />
              </Grid>
            </Grid>
            {tables && (
              <Typography variant="caption" color="text.secondary">
                {t('rest-help', {
                  percent: tables.restHpPercentPerPeriod,
                  hours: tables.restPeriodHours,
                  multiplier: tables.fullRestDayMultiplier,
                })}
              </Typography>
            )}
            {alive.length === 0 ? (
              <EmptyState dense title={t('pass-time-no-characters')} />
            ) : (
              <>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <SectionLabel sx={{ flexGrow: 1 }}>{t('characters')}</SectionLabel>
                  <TextField
                    select
                    size="small"
                    label={t('pass-time-set-all')}
                    value=""
                    onChange={(e) => setAll(e.target.value as PassTimeActivity)}
                    sx={{ minWidth: 200 }}
                  >
                    {PASS_TIME_ACTIVITIES.map((activity) => (
                      <MenuItem key={activity} value={activity}>
                        {t(`activity-${activity}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <DataTable
                  rows={characters ?? []}
                  getKey={(character) => character.id}
                  columns={[
                    { key: 'character', header: t('character'), render: (character) => character.name },
                    {
                      key: 'hp',
                      header: t('hp'),
                      render: (character) => `${character.hp.current} / ${character.hp.max}`,
                    },
                    {
                      key: 'power',
                      header: t('power-points'),
                      render: (character) =>
                        character.power ? `${character.power.current} / ${character.power.max}` : '—',
                    },
                    {
                      key: 'injuries',
                      header: t('injuries'),
                      render: (character) =>
                        (character.injuries ?? []).filter((i) => i.status !== 'healed').length || '—',
                    },
                    {
                      key: 'activity',
                      header: t('pass-time-activity'),
                      render: (character) =>
                        character.status === 'dead' ? (
                          <Typography variant="body2" color="text.secondary">
                            {t('dead')}
                          </Typography>
                        ) : (
                          <TextField
                            select
                            size="small"
                            value={activityOf(character.id)}
                            onChange={(e) =>
                              setActivities({ ...activities, [character.id]: e.target.value as PassTimeActivity })
                            }
                            slotProps={{
                              htmlInput: { 'aria-label': `${t('pass-time-activity')} ${character.name}` },
                            }}
                            sx={{ minWidth: 180 }}
                          >
                            {PASS_TIME_ACTIVITIES.map((activity) => (
                              <MenuItem key={activity} value={activity}>
                                {t(`activity-${activity}`)}
                              </MenuItem>
                            ))}
                          </TextField>
                        ),
                    },
                  ]}
                />
              </>
            )}
            {consumption}
            {preview && (
              <Stack spacing={1}>
                <SectionLabel>
                  {t('pass-time-preview-title', { from: preview.fromDay, to: preview.toDay })}
                </SectionLabel>
                <PassTimeResults results={preview.characters} characters={characters} dense />
              </Stack>
            )}
          </Stack>
        )}
      </RmuDialog>
      {retry && (
        <RestDialog
          character={retry.character}
          open={!!retry}
          initial={retryInitial}
          onClose={() => setRetry(undefined)}
          onRested={(character) => {
            queryClient.setQueryData<Character[]>(charactersKey, (current) =>
              current?.map((c) => (c.id === character.id ? character : c))
            );
            setDone(
              (current) =>
                current && {
                  ...current,
                  characters: current.characters.map((c) =>
                    c.characterId === character.id ? { ...c, error: undefined, result: undefined } : c
                  ),
                }
            );
          }}
        />
      )}
    </>
  );
};

export default PassTimeDialog;
