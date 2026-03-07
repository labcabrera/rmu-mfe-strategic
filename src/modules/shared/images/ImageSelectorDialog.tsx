import React, { FC, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { t } from 'i18next';

const ImageSelectorDialog: FC<{
  value?: string;
  open: boolean;
  images: string[];
  onClose: () => void;
  onSelect: (image: string) => void;
  title?: string;
}> = ({ value, open, images, onClose, onSelect, title = 'Select an image' }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(value ?? null);

  useEffect(() => {
    setSelectedImage(value ?? null);
  }, [value]);

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
    <Dialog open={open} onClose={onClose} fullScreen={true} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={1}>
          {images.map((img, index) => {
            const isSelected = img === selectedImage;

            return (
              <Grid key={index} size={{ xs: 4, md: 1 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderWidth: isSelected ? 3 : 1,
                    borderStyle: 'solid',
                    borderColor: isSelected ? 'success.main' : 'divider',
                    boxShadow: isSelected ? 6 : 0,
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
                  }}
                >
                  <CardActionArea
                    onClick={() => handleImageClick(img)}
                    sx={{
                      // feedback visual
                      outline: 'none',
                    }}
                  >
                    <CardMedia
                      component="img"
                      src={img}
                      alt={img}
                      loading="lazy"
                      sx={{
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                      }}
                    />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t('custom-image-url')}
              value={selectedImage ?? ''}
              onChange={(e) => setSelectedImage(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
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
