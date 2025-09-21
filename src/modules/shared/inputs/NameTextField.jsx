/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { fetchRandomName } from '../../api/npc-random-names';

const NameTextField = ({ value, onChange, required = false, generateRandomRaceValue }) => {
  const { t } = useTranslation();

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
      label={t('name')}
      variant="standard"
      value={value}
      onChange={onChange}
      required={required}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircleIcon />
            </InputAdornment>
          ),
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
