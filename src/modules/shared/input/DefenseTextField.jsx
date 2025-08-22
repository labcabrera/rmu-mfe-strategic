import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const DefenseTextField = ({ value, onChange, i18nLabel = 'defensive-bonus', disabled = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      value={value}
      disabled={disabled}
      fullWidth
      variant="outlined"
      onChange={onChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/shield.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default DefenseTextField;
