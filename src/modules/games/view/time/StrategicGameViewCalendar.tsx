/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Button, Collapse, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import {
  EmptyState,
  fetchGameTimeLog,
  formatCampaignDate,
  formatElapsedTime,
  GameTimeLogEntry,
  Panel,
  RmuPagination,
  SectionLabel,
  StrategicGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';
import PassTimeResults from './PassTimeResults';

const PAGE_SIZE = 5;

/**
 * Calendar of the campaign (spec 065): the current day since the start date, the button to pass time for the game
 * master, and the time log with what each step did to the characters.
 */
const StrategicGameViewCalendar: FC<{
  game: StrategicGame;
  canPassTime: boolean;
  onPassTime: () => void;
  /** Changes when time passes, to read the log again */
  refreshKey: number;
}> = ({ game, canPassTime, onPassTime, refreshKey }) => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [page, setPage] = useState(0);
  const [log, setLog] = useState<{ content: GameTimeLogEntry[]; totalPages: number }>();
  const [expanded, setExpanded] = useState<string>();

  useEffect(() => {
    fetchGameTimeLog(game.id, page, PAGE_SIZE, auth)
      .then((data) => setLog({ content: data.content, totalPages: data.pagination.totalPages }))
      .catch(notify.error);
  }, [game.id, page, refreshKey]);

  const entryText = (entry: GameTimeLogEntry) =>
    entry.type === 'adjust'
      ? t('time-log-adjust', { from: entry.fromDay, to: entry.toDay })
      : t('time-log-pass-time', {
          from: entry.fromDay,
          to: entry.toDay,
          time: formatElapsedTime(entry.days, entry.hours, t),
        });

  return (
    <Panel
      title={t('calendar')}
      extra={
        canPassTime && (
          <Button size="small" variant="contained" onClick={onPassTime}>
            {t('pass-time')}
          </Button>
        )
      }
    >
      <Stack spacing={1}>
        <Typography variant="h6">{formatCampaignDate(game.calendar, t)}</Typography>
        {!game.calendar?.startDate && (
          <Typography variant="body2" color="text.secondary">
            {t('no-start-date')}
          </Typography>
        )}
        <SectionLabel sx={{ pt: 1 }}>{t('time-log')}</SectionLabel>
        {log && log.content.length === 0 && <EmptyState dense title={t('time-log-empty')} />}
        {log && log.content.length > 0 && (
          <List dense disablePadding>
            {log.content.map((entry) => {
              const failed = entry.characters.filter((c) => c.error).length;
              const open = expanded === entry.id;
              return (
                <ListItem key={entry.id} disableGutters divider sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <ListItemText
                      primary={entryText(entry)}
                      secondary={[
                        entry.note,
                        new Date(entry.createdAt).toLocaleString(i18n.language),
                        failed > 0 ? t('pass-time-partial', { count: failed }) : undefined,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      slotProps={{ secondary: { color: failed > 0 ? 'warning.main' : undefined } }}
                    />
                    {entry.characters.length > 0 && (
                      <Button size="small" onClick={() => setExpanded(open ? undefined : entry.id)}>
                        {t(open ? 'hide' : 'details')}
                      </Button>
                    )}
                  </Stack>
                  <Collapse in={open} unmountOnExit>
                    <Box sx={{ pb: 1, overflowX: 'auto' }}>
                      <PassTimeResults results={entry.characters} dense />
                    </Box>
                  </Collapse>
                </ListItem>
              );
            })}
          </List>
        )}
        {log && log.totalPages > 1 && (
          <RmuPagination dense page={page} pageSize={PAGE_SIZE} totalPages={log.totalPages} setPage={setPage} />
        )}
      </Stack>
    </Panel>
  );
};

export default StrategicGameViewCalendar;
