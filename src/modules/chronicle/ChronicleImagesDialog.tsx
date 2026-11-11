import { ChangeEvent, FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import { Alert, Box, Button, IconButton, ImageList, ImageListItem, ImageListItemBar, Tooltip } from '@mui/material';
import {
  campaignImageScope,
  ConfirmDialog,
  deleteImage,
  EmptyState,
  fetchImagesByScope,
  imagePath,
  LoadingState,
  MediaImage,
  resolveAssetUrl,
  RmuDialog,
  uploadImage,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/** Uploads an image to the chronicle of a campaign and returns the path to store in the Markdown. */
export const uploadChronicleImage = async (
  auth: ReturnType<typeof useAuth>,
  gameId: string,
  file: File
): Promise<string> => {
  const image = await uploadImage(auth, {
    file,
    filename: file.name,
    category: 'chronicle',
    scope: campaignImageScope(gameId),
    altText: file.name.replace(/\.[^.]+$/, ''),
  });
  return imagePath(image);
};

export const chronicleImagesKey = (gameId: string) => ['chronicle-images', gameId];

/**
 * The images of the chronicle of a campaign (workspace spec 102, decision 4): they belong to the campaign, not to a
 * chapter, so any chapter can use them again. Picking one inserts it; whoever uploaded an image can delete it.
 */
const ChronicleImagesDialog: FC<{
  gameId: string;
  open: boolean;
  onClose: () => void;
  onPick: (image: MediaImage) => void;
}> = ({ gameId, open, onClose, onPick }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState<MediaImage>();
  const key = chronicleImagesKey(gameId);
  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchImagesByScope(campaignImageScope(gameId), 0, 100, auth).then((page) => page.content),
    enabled: open,
  });
  const userId = auth.user?.profile.sub;

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    uploadChronicleImage(auth, gameId, file)
      .then(() => queryClient.invalidateQueries({ queryKey: key }))
      .catch(notify.error)
      .finally(() => setUploading(false));
  };

  const remove = (image: MediaImage) =>
    deleteImage(auth, image.id)
      .then(() => queryClient.invalidateQueries({ queryKey: key }))
      .catch(notify.error)
      .finally(() => setToDelete(undefined));

  let content;
  if (query.isLoading) content = <LoadingState />;
  else if (!query.data?.length) content = <EmptyState dense title={t('chronicle-images-empty')} />;
  else
    content = (
      <ImageList cols={3} gap={8} sx={{ m: 0 }}>
        {query.data.map((image) => (
          <ImageListItem key={image.id} sx={{ cursor: 'pointer' }} onClick={() => onPick(image)}>
            <Box
              component="img"
              src={resolveAssetUrl(imagePath(image))}
              alt={image.altText ?? ''}
              loading="lazy"
              sx={{ height: 140, objectFit: 'cover', borderRadius: 1 }}
            />
            <ImageListItemBar
              title={image.altText || image.originalFilename}
              actionIcon={
                image.owner === userId && (
                  <Tooltip title={t('delete')}>
                    <IconButton
                      size="small"
                      sx={{ color: 'common.white' }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setToDelete(image);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    );

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={t('chronicle-images')}
      buttons={
        <>
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onFile} />
          <Button startIcon={<UploadIcon />} disabled={uploading} onClick={() => input.current?.click()}>
            {t(uploading ? 'chronicle-image-uploading' : 'chronicle-image-upload')}
          </Button>
        </>
      }
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('chronicle-images-help')}
      </Alert>
      {content}
      <ConfirmDialog
        open={!!toDelete}
        title={t('chronicle-image-delete')}
        message={t('chronicle-image-delete-message')}
        confirmLabel={t('delete')}
        destructive
        onClose={() => setToDelete(undefined)}
        onConfirm={() => toDelete && remove(toDelete)}
      />
    </RmuDialog>
  );
};

export default ChronicleImagesDialog;
