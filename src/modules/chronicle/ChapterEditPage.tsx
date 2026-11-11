import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  ApiError,
  CHAPTER_VISIBILITIES,
  ChapterVisibility,
  ChronicleChapter,
  fetchChronicleChapter,
  fetchStrategicGame,
  FormPage,
  imagePath,
  LoadingState,
  MAX_CHAPTER_CONTENT_LENGTH,
  MAX_CHAPTER_TITLE_LENGTH,
  MediaImage,
  RmuDialog,
  updateChronicleChapter,
  useApiNotify,
  useEntity,
  useMarkdownDraft,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { MarkdownImageChoice } from '@labcabrera-rmu/rmu-react-shared-lib/markdown-editor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ChronicleImagesDialog, { chronicleImagesKey, uploadChronicleImage } from './ChronicleImagesDialog';
import { chapterPath, chronicleKey } from './chronicle-paths';

// The editor (Lexical, CodeMirror and their styles) only loads on this page.
const MarkdownEditor = lazy(() => import('@labcabrera-rmu/rmu-react-shared-lib/markdown-editor'));

type Form = { title: string; visibility: ChapterVisibility; campaignDate: string; content: string };

const formOf = (chapter: ChronicleChapter): Form => ({
  title: chapter.title,
  visibility: chapter.visibility,
  campaignDate: chapter.campaignDate ? String(chapter.campaignDate) : '',
  content: chapter.content ?? '',
});

const isConflict = (error: unknown) => error instanceof ApiError && error.status === 409;

/**
 * Edits a chapter of the chronicle (workspace spec 102): title, visibility, day of the campaign and the Markdown, with
 * the visual / Markdown editor. A copy of the text not saved yet stays in the browser, and a save over a newer version
 * asks what to keep.
 */
export default function ChapterEditPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useApiNotify();
  const queryClient = useQueryClient();
  const { gameId, chapterId } = useParams<{ gameId: string; chapterId: string }>();
  const state = useEntity<ChronicleChapter>(chapterId, (id) => fetchChronicleChapter(id, auth), {
    initial: location.state?.chapter?.content !== undefined ? location.state.chapter : undefined,
    onError: notify.error,
  });
  const gameQuery = useQuery({
    queryKey: ['strategic-game', gameId],
    queryFn: () => fetchStrategicGame(gameId!, auth),
  });
  const chapter = state.entity;
  const [form, setForm] = useState<Form>();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  // A new key remounts the editor: it reads its Markdown only when it mounts.
  const [editorKey, setEditorKey] = useState(0);
  const [imagesOpen, setImagesOpen] = useState(false);
  const pickResolver = useRef<(choice: MarkdownImageChoice | undefined) => void>(undefined);
  const draft = useMarkdownDraft(`chronicle-${chapterId}`);
  const [draftOffered, setDraftOffered] = useState(true);

  useEffect(() => {
    if (chapter && !form) setForm(formOf(chapter));
  }, [chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  const viewPath = chapterPath(gameId!, chapterId!);
  const pendingDraft =
    draftOffered && chapter && draft.draft && draft.draft.text !== (chapter.content ?? '') ? draft.draft : undefined;

  const change = (patch: Partial<Form>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setDirty(true);
    if (patch.content !== undefined) draft.save(patch.content, chapter?.version);
  };

  const save = (version = chapter?.version) => {
    if (!form || !chapter) return;
    const day = Number.parseInt(form.campaignDate, 10);
    setSaving(true);
    updateChronicleChapter(
      chapter.id,
      {
        title: form.title.trim(),
        visibility: form.visibility,
        campaignDate: Number.isFinite(day) && day > 0 ? day : null,
        content: form.content,
        version,
      },
      auth
    )
      .then((saved) => {
        draft.clear();
        setDirty(false);
        queryClient.invalidateQueries({ queryKey: chronicleKey(gameId!) });
        navigate(viewPath, { replace: true, state: { chapter: saved } });
      })
      .catch((error) => (isConflict(error) ? setConflict(true) : notify.error(error)))
      .finally(() => setSaving(false));
  };

  /** Keeps this text: saves it over the version another master stored. */
  const saveMine = () => {
    setConflict(false);
    fetchChronicleChapter(chapterId!, auth)
      .then((latest) => save(latest.version))
      .catch(notify.error);
  };

  /** Drops this text and loads what the other master saved (the text stays in the draft until then). */
  const loadTheirs = () => {
    setConflict(false);
    fetchChronicleChapter(chapterId!, auth)
      .then((latest) => {
        state.setEntity(latest);
        setForm(formOf(latest));
        setDirty(false);
        setEditorKey((key) => key + 1);
      })
      .catch(notify.error);
  };

  const recoverDraft = () => {
    if (!pendingDraft) return;
    change({ content: pendingDraft.text });
    setEditorKey((key) => key + 1);
    setDraftOffered(false);
  };

  const discardDraft = () => {
    draft.clear();
    setDraftOffered(false);
  };

  const pickImage = () =>
    new Promise<MarkdownImageChoice | undefined>((resolve) => {
      pickResolver.current = resolve;
      setImagesOpen(true);
    });

  const closeImages = (image?: MediaImage) => {
    setImagesOpen(false);
    pickResolver.current?.(image ? { src: imagePath(image), alt: image.altText ?? '' } : undefined);
    pickResolver.current = undefined;
  };

  const upload = (file: File) =>
    uploadChronicleImage(auth, gameId!, file).then((path) => {
      queryClient.invalidateQueries({ queryKey: chronicleImagesKey(gameId!) });
      return path;
    });

  const valid = !!form && form.title.trim().length > 0 && form.content.length <= MAX_CHAPTER_CONTENT_LENGTH;
  const gamePath = `/strategic/games/view/${gameId}`;

  return (
    <FormPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('strategic-module'), link: '/strategic' },
        { name: t('strategic-games'), link: '/strategic/games' },
        { name: gameQuery.data?.name ?? t('strategic-game'), link: gamePath },
        { name: chapter?.title ?? t('chronicle'), link: viewPath },
        { name: t('edit') },
      ]}
      entity={state}
      dirty={dirty}
      saveDisabled={!valid || saving}
      onSave={() => save()}
      onCancel={() => {
        draft.clear();
        navigate(viewPath);
      }}
    >
      {form && (
        <Stack spacing={2}>
          {pendingDraft && (
            <Alert
              severity="warning"
              action={
                <Stack direction="row" spacing={1}>
                  <Button color="inherit" size="small" onClick={recoverDraft}>
                    {t('chapter-draft-recover')}
                  </Button>
                  <Button color="inherit" size="small" onClick={discardDraft}>
                    {t('discard')}
                  </Button>
                </Stack>
              }
            >
              {t('chapter-draft-found', { date: new Date(pendingDraft.savedAt).toLocaleString() })}
            </Alert>
          )}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label={t('chapter-title')}
              value={form.title}
              onChange={(e) => change({ title: e.target.value })}
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: MAX_CHAPTER_TITLE_LENGTH } }}
            />
            <TextField
              select
              label={t('chapter-visibility')}
              value={form.visibility}
              onChange={(e) => change({ visibility: e.target.value as ChapterVisibility })}
              sx={{ minWidth: 220 }}
            >
              {CHAPTER_VISIBILITIES.map((visibility) => (
                <MenuItem key={visibility} value={visibility}>
                  {t(`chapter-visibility-${visibility}`)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label={t('chapter-campaign-date')}
              value={form.campaignDate}
              onChange={(e) => change({ campaignDate: e.target.value })}
              helperText={t('chapter-campaign-date-help')}
              sx={{ minWidth: 180 }}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Stack>
          {form.visibility === 'master' && <Alert severity="info">{t('chronicle-images-private-help')}</Alert>}
          <Suspense fallback={<LoadingState />}>
            <MarkdownEditor
              key={editorKey}
              markdown={form.content}
              onChange={(content) => content !== form.content && change({ content })}
              onUploadImage={upload}
              onPickImage={pickImage}
              maxLength={MAX_CHAPTER_CONTENT_LENGTH}
              placeholder={t('chapter-placeholder')}
              minHeight={420}
            />
          </Suspense>
        </Stack>
      )}
      <ChronicleImagesDialog
        gameId={gameId!}
        open={imagesOpen}
        onClose={() => closeImages()}
        onPick={(image) => closeImages(image)}
      />
      <RmuDialog
        open={conflict}
        onDismiss={() => setConflict(false)}
        maxWidth="sm"
        title={t('chapter-conflict-title')}
        buttons={
          <>
            <Button onClick={() => setConflict(false)}>{t('cancel')}</Button>
            <Button color="warning" onClick={loadTheirs}>
              {t('chapter-conflict-load-theirs')}
            </Button>
            <Button variant="contained" onClick={saveMine}>
              {t('chapter-conflict-keep-mine')}
            </Button>
          </>
        }
      >
        <Typography>{t('chapter-conflict-message')}</Typography>
      </RmuDialog>
    </FormPage>
  );
}
