import React, { FC, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';

const ImageSelectorDialog: FC<{
  open: boolean;
  images: string[];
  onClose: () => void;
  onSelect: (image: string) => void;
  title?: string;
}> = ({ open, images, onClose, onSelect, title = 'Select an image' }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleSave = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          minHeight: 600,
          minWidth: 1200,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          {images.map((img) => (
            <Grid key={img}>
              <Avatar
                src={img}
                variant="square"
                sx={{
                  width: 150,
                  height: 150,
                  border: selectedImage === img ? '3px solid #d99714ff' : '2px solid #cccccc',
                  cursor: 'pointer',
                  transition: 'border 0.2s',
                }}
                onClick={() => handleImageClick(img)}
              />
            </Grid>
          ))}
        </Grid>
        {!images.length && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No images available.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSave} disabled={!selectedImage} variant="contained" color="primary">
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageSelectorDialog;
