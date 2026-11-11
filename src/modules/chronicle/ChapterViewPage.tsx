import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Box, Button, Chip, Link, Paper, Stack, Typography } from '@mui/material';
import {
  ChronicleChapter,
  deleteChronicleChapter,
  DetailPage,
  extractHeadings,
  fetchChronicleChapter,
  fetchChronicleChapters,
  fetchStrategicGame,
  MarkdownContent,
  useApiNotify,
  useEntity,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { isGameMaster } from '../shared/permissions';
import { chapterPath, chronicleKey, neighbours } from './chronicle-paths';

/** A chapter of the chronicle of a campaign, to read (workspace spec 102), with its contents and the next chapters. */
export default function ChapterViewPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useApiNotify();
  const { gameId, chapterId } = useParams<{ gameId: string; chapterId: string }>();
  const state = useEntity<ChronicleChapter>(chapterId, (id) => fetchChronicleChapter(id, auth), {
    // The list carries no content: only a chapter passed with it is used as is.
    initial: location.state?.chapter?.content !== undefined ? location.state.chapter : undefined,
    onError: notify.error,
  });
  const gameQuery = useQuery({
    queryKey: ['strategic-game', gameId],
    queryFn: () => fetchStrategicGame(gameId!, auth),
  });
  const chaptersQuery = useQuery({
    queryKey: chronicleKey(gameId!),
    queryFn: () => fetchChronicleChapters(gameId!, auth),
  });
  const game = gameQuery.data;
  const master = isGameMaster(auth, game);
  const headings = useMemo(() => extractHeadings(state.entity?.content ?? ''), [state.entity?.content]);
  const { previous, next } = neighbours(chaptersQuery.data, chapterId!);
  const gamePath = `/strategic/games/view/${gameId}`;

  const onDelete = (chapter: ChronicleChapter) =>
    deleteChronicleChapter(chapter.id, auth)
      .then(() => navigate(gamePath, { replace: true }))
      .catch(notify.error);

  return (
    <DetailPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: game?.name ?? t('strategic-game'), link: gamePath },
        { name: state.entity?.title ?? t('chronicle') },
      ]}
      entity={state}
      technicalInfo={false}
      onEdit={master ? (chapter) => navigate(`${chapterPath(gameId!, chapter.id)}/edit`) : undefined}
      onDelete={master ? onDelete : undefined}
      deleteMessage={(chapter) => t('chapter-delete-message', { title: chapter.title })}
    >
      {(chapter) => (
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          <Box component="article" sx={{ flex: 1, minWidth: 0, maxWidth: 860 }}>
            <Typography variant="overline" color="text.secondary">
              {t('chronicle')}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              {chapter.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
              {chapter.visibility === 'master' && (
                <Chip size="small" icon={<LockOutlinedIcon />} label={t('chapter-visibility-master-short')} />
              )}
              {chapter.campaignDate ? (
                <Chip size="small" variant="outlined" label={t('campaign-day', { day: chapter.campaignDate })} />
              ) : null}
            </Stack>
            {chapter.content?.trim() ? (
              <MarkdownContent markdown={chapter.content} />
            ) : (
              <Alert severity="info">{t(master ? 'chapter-empty-master' : 'chapter-empty')}</Alert>
            )}
            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 5, gap: 2 }}>
              <Box>
                {previous && (
                  <Button startIcon={<ChevronLeftIcon />} onClick={() => navigate(chapterPath(gameId!, previous.id))}>
                    {previous.title}
                  </Button>
                )}
              </Box>
              <Box>
                {next && (
                  <Button endIcon={<ChevronRightIcon />} onClick={() => navigate(chapterPath(gameId!, next.id))}>
                    {next.title}
                  </Button>
                )}
              </Box>
            </Stack>
          </Box>
          {headings.length > 1 && (
            <Paper
              variant="outlined"
              component="nav"
              sx={{ display: { xs: 'none', lg: 'block' }, width: 260, p: 2, position: 'sticky', top: 96 }}
            >
              <Typography variant="overline" color="text.secondary">
                {t('chapter-contents')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {headings.map((heading) => (
                  <Link key={heading.id} href={`#${heading.id}`} variant="body2" underline="hover">
                    {heading.text}
                  </Link>
                ))}
              </Stack>
            </Paper>
          )}
        </Box>
      )}
    </DetailPage>
  );
}
