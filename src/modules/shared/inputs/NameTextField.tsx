import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CachedIcon from '@mui/icons-material/Cached';
import { IconButton } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { TextField } from '@mui/material';
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
  const { t } = useTranslation();
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
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleRandomNameClick} color="primary" aria-label={t('random-name')}>
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
