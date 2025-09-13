import React, { FC } from 'react';
import { Avatar, InputAdornment } from '@mui/material';
import TextField, { TextFieldProps } from '@mui/material/TextField';

interface MovementTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string | number;
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageName: string;
  disabled?: boolean;
  required?: boolean;
  textAlign?: 'right' | 'left' | 'center';
}

const ImageTextField: FC<MovementTextFieldProps> = ({
  value,
  label,
  imageName,
  onChange,
  disabled = false,
  required = false,
  textAlign = 'right',
  ...props
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      variant="standard"
      fullWidth
      sx={{
        '& .MuiInputBase-input': {
          textAlign: textAlign,
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src={`/static/images/icons/${imageName}.png`} sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};

export default ImageTextField;
