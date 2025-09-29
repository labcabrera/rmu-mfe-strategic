import React, { useEffect, useMemo, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';

export type NumericInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  integer?: boolean;
  allowNegatives?: boolean;
  maxFractionDigits?: number;
  min?: number;
  max?: number;
  formatOnBlur?: boolean;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

export function NumericInput({
  value,
  onChange,
  integer = false,
  allowNegatives = true,
  maxFractionDigits = 2,
  min,
  max,
  formatOnBlur = true,
  name,
  id,
  label,
  placeholder,
  disabled,
  autoFocus,
  className,
  inputMode,
  error = false,
  onBlur,
  onFocus,
}: NumericInputProps) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: integer ? 0 : Math.max(0, maxFractionDigits),
      }),
    [integer, maxFractionDigits]
  );

  const [text, setText] = useState<string>(formatValue(value, formatter));
  const lastCommitted = useRef<number | null>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (lastCommitted.current !== value) {
      setText(formatValue(value, formatter));
      lastCommitted.current = value;
    }
  }, [value, formatter]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let next = e.target.value;
    next = next.replace(/\s+/g, '');
    const allowed = allowNegatives ? /^[+-]?([0-9]+)?(\.[0-9]*)?$/ : /^([0-9]+)?(\.[0-9]*)?$/;
    next = next.replace(/,/g, '');
    if (!allowed.test(next) && next !== '') return;
    if (!allowNegatives && /^-/.test(next)) return;
    if (integer && next.includes('.')) return;
    if (!integer && next.includes('.')) {
      const [, decimals = ''] = next.split('.');
      if (decimals.length > Math.max(0, maxFractionDigits)) return;
    }

    setText(next);
    if (!formatOnBlur) {
      const parsed = parseEnglishNumber(next);
      onChange(parsed);
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parsed = parseEnglishNumber(text);
    let nextNumber: number | null = parsed;

    if (parsed !== null) {
      if (typeof min === 'number') nextNumber = Math.max(min, parsed);
      if (typeof max === 'number' && nextNumber !== null) nextNumber = Math.min(max, nextNumber);
      if (!integer) {
        const factor = Math.pow(10, Math.max(0, maxFractionDigits));
        nextNumber = Math.round((nextNumber as number) * factor) / factor;
      } else {
        nextNumber = Math.trunc(nextNumber as number);
      }
    }

    lastCommitted.current = nextNumber;
    onChange(nextNumber);
    setText(formatValue(nextNumber, formatter));
    onBlur?.(e);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    if (text === formatValue(value, formatter)) {
      setText(value === null ? '' : toEnglishRaw(value));
    }
    onFocus?.(e);
  }

  function formatValue(value: number | null, formatter: Intl.NumberFormat): string {
    if (value === null || Number.isNaN(value)) return '';
    return formatter.format(value);
  }

  function toEnglishRaw(value: number): string {
    return String(value);
  }

  function parseEnglishNumber(raw: string): number | null {
    const s = raw.replace(/\s+/g, '').replace(/,/g, '');
    if (s === '' || s === '-' || s === '+' || s === '.' || s === '-.' || s === '+.') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  return (
    <TextField
      inputRef={inputRef}
      type="text"
      inputMode={inputMode ?? (integer ? 'numeric' : 'decimal')}
      name={name}
      id={id}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={className}
      fullWidth
      variant="standard"
      error={error}
      sx={{
        '& input': {
          textAlign: 'right',
        },
      }}
    />
  );
}

export default NumericInput;
