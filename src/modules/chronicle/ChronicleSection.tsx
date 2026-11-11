import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Box,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  AddButton,
  ChronicleChapter,
  createChronicleChapter,
  EmptyState,
  fetchChronicleChapters,
  LoadingState,
  MAX_CHAPTER_TITLE_LENGTH,
  MAX_CHRONICLE_CHAPTERS,
  Panel,
  reorderChronicleChapters,
  RmuDialog,
  StrategicGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chapterPath, chronicleKey, moveChapter } from './chronicle-paths';

/** New chapter: only its title; the text is written in the editor that opens next. */
const NewChapterDialog: FC<{ open: boolean; onClose: () => void; onCreate: (title: string) => Promise<void> }> = ({
  open,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = title.trim().length > 0;
  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    onCreate(title.trim()).finally(() => setBusy(false));
  };
  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('chronicle-new-chapter')}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button variant="contained" onClick={submit} disabled={!valid || busy}>
            {t('create')}
          </Button>
        </>
      }
    >
      <TextField
        autoFocus
        fullWidth
        margin="dense"
        label={t('chapter-title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        slotProps={{ htmlInput: { maxLength: MAX_CHAPTER_TITLE_LENGTH } }}
      />
    </RmuDialog>
  );
};

/**
 * The chronicle of a campaign (workspace spec 102): its chapters in order, private ones marked. The masters create
 * chapters and change their order.
 */
const ChronicleSection: FC<{ game: StrategicGame; master: boolean }> = ({ game, master }) => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const notify = useApiNotify();
  const queryClient = useQueryClient();
  const [newOpen, setNewOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const key = chronicleKey(game.id);
  const query = useQuery({ queryKey: key, queryFn: () => fetchChronicleChapters(game.id, auth), gcTime: 0 });
  const chapters = query.data;

  const create = (title: string) =>
    createChronicleChapter({ gameId: game.id, title }, auth)
      .then((chapter) => {
        setNewOpen(false);
        navigate(`${chapterPath(game.id, chapter.id)}/edit`, { state: { chapter } });
      })
      .catch(notify.error);

  const move = (index: number, delta: -1 | 1) => {
    if (!chapters || busy) return;
    const reordered = moveChapter(chapters, index, delta);
    if (reordered === chapters) return;
    setBusy(true);
    queryClient.setQueryData<ChronicleChapter[]>(key, reordered);
    reorderChronicleChapters(
      game.id,
      reordered.map((chapter) => chapter.id),
      auth
    )
      .catch((error) => {
        notify.error(error);
        return queryClient.invalidateQueries({ queryKey: key });
      })
      .finally(() => setBusy(false));
  };

  const updated = (chapter: ChronicleChapter) =>
    new Date(chapter.updatedAt).toLocaleDateString(i18n.language, { dateStyle: 'medium' });

  let content;
  if (query.error) content = <EmptyState dense title={t('error-chronicle-load')} />;
  else if (!chapters) content = <LoadingState />;
  else if (chapters.length === 0)
    content = <EmptyState dense title={t(master ? 'chronicle-empty-master' : 'chronicle-empty')} />;
  else
    content = (
      <List dense disablePadding>
        {chapters.map((chapter, index) => (
          <ListItem
            key={chapter.id}
            disablePadding
            secondaryAction={
              master && (
                <Stack direction="row">
                  <Tooltip title={t('chronicle-move-up')}>
                    <span>
                      <IconButton size="small" disabled={busy || index === 0} onClick={() => move(index, -1)}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('chronicle-move-down')}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={busy || index === chapters.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              )
            }
          >
            <ListItemButton
              onClick={() => navigate(chapterPath(game.id, chapter.id), { state: { chapter } })}
              sx={{ pr: master ? 12 : 2 }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box component="span">{chapter.title}</Box>
                    {chapter.visibility === 'master' && (
                      <Chip size="small" icon={<LockOutlinedIcon />} label={t('chapter-visibility-master-short')} />
                    )}
                  </Stack>
                }
                secondary={[
                  chapter.campaignDate ? t('campaign-day', { day: chapter.campaignDate }) : undefined,
                  t('chapter-updated-at', { date: updated(chapter) }),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );

  const full = (chapters?.length ?? 0) >= MAX_CHRONICLE_CHAPTERS;
  return (
    <Panel
      title={t('chronicle')}
      extra={master && <AddButton onClick={() => setNewOpen(true)} disabled={!chapters || full} />}
    >
      {content}
      {master && <NewChapterDialog open={newOpen} onClose={() => setNewOpen(false)} onCreate={create} />}
    </Panel>
  );
};

export default ChronicleSection;
