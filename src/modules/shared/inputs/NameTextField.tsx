import React, { FC } from 'react';
import { useAuth } from 'react-oidc-context';
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { fetchRandomName } from '../../api/npc-random-names';

interface NameTextFieldProps {
  label: string;
  value?: string;
  required?: boolean;
  generateRandomRaceValue?: string;
  gender: string | undefined;
  onChange: (value: string) => void;
  onError: (value: string) => void;
}

const NameTextField: FC<NameTextFieldProps> = ({
  label,
  value = '',
  required = true,
  generateRandomRaceValue,
  gender,
  onChange,
  onError,
}) => {
  const auth = useAuth();

  const handleRandomNameClick = () => {
    fetchRandomName(generateRandomRaceValue, gender, auth)
      .then((name) => {
        console.log('name: ', name);
        return name;
      })
      .then((name) => onChange(name))
      .catch((err) => onError(err.message));
  };

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        fullWidth
        error={required && !value}
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleRandomNameClick} aria-label="generate random name">
                  <CachedIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
};

export default NameTextField;
