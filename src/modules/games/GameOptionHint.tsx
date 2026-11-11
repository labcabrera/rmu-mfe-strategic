import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';
import { FieldHint, OptionHelp } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';

/**
 * The help of a campaign option (spec 052): what it does, what raising or lowering it implies and its default,
 * `game-option-<option>-help`. Click or tap pins it; a resting mouse previews it.
 */
const GameOptionHint: FC<{ option: string; label: string; defaultValue?: number | string | boolean }> = ({
  option,
  label,
  defaultValue,
}) => {
  const { t } = useTranslation();
  const value = typeof defaultValue === 'string' ? t(`${option}-${defaultValue}`) : defaultValue;
  return (
    <FieldHint
      title={label}
      description={t(`game-option-${option}-help`)}
      params={value === undefined ? undefined : { default: value }}
    />
  );
};

/** A form field of a campaign option with its help button at its side. */
export const GameOptionField: FC<{
  option: string;
  label: string;
  defaultValue?: number | string | boolean;
  children: ReactNode;
}> = ({ children, ...hint }) => (
  // At the field's top, not the middle of the field plus its helper text (8px centres it on a 56px input)
  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
    <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    <Box sx={{ mt: 1 }}>
      <GameOptionHint {...hint} />
    </Box>
  </Stack>
);

/** A row of an options block of the campaign view: its key, label, value in use and default. */
export interface GameOptionRow {
  option: string;
  label: string;
  value: ReactNode;
  defaultValue: number | string | boolean;
}

/**
 * The entries of the help dialog of an options block (spec 066, decision 17): the same help text and default as
 * GameOptionHint (translated strings, yes or no for booleans).
 */
export const gameOptionsHelp = (rows: GameOptionRow[], t: TFunction): OptionHelp[] =>
  rows.map(({ option, label, value, defaultValue }) => ({
    key: option,
    label,
    value,
    defaultValue:
      typeof defaultValue === 'string'
        ? t(`${option}-${defaultValue}`)
        : typeof defaultValue === 'boolean'
          ? t(defaultValue ? 'yes' : 'no')
          : String(defaultValue),
    description: t(`game-option-${option}-help`),
  }));
