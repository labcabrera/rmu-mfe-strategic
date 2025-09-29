import React from 'react';
import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { fetchRandomName } from '../../api/npc-random-names';

const NameTextField = ({ label, value, onChange, required = true, generateRandomRaceValue }) => {
  const handleRandomNameClick = async () => {
    var race = 'generic';
    if (generateRandomRaceValue) {
      race = generateRandomRaceValue.toLowerCase();
    }
    const name = await fetchRandomName(race);
    onChange({
      target: {
        name: 'name',
        value: name,
      },
    });
  };

  return (
    <TextField
      label={label}
      variant="standard"
      value={value}
      onChange={onChange}
      fullWidth
      error={required && (!value || value.trim() === '')}
      helperText={required && !value ? t('required-field') : ''}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleRandomNameClick}>
                <CachedIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default NameTextField;
