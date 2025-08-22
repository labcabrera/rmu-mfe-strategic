/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const HeightTextField = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t('height')}
      variant="outlined"
      fullWidth
      value={value}
      onChange={onChange}
      required
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/height.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default HeightTextField;
