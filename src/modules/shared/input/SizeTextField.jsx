import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const SizeTextField = ({ value, i18nLabel = 'size' }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      value={value ? t(`size-${value}`) : ''}
      disabled
      fullWidth
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/size.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SizeTextField;
