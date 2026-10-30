import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack } from '@mui/material';
import { FieldHint } from '@labcabrera-rmu/rmu-react-shared-lib';

/**
 * The help of a campaign option (spec 052): what it does, what raising or lowering it implies and its default,
 * `game-option-<option>-help`. Click or tap pins it; a resting mouse previews it.
 */
export const GameOptionHint: FC<{ option: string; label: string; defaultValue?: number | string | boolean }> = ({
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
  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
    <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    <GameOptionHint {...hint} />
  </Stack>
);

/** The label of an option row of the campaign view, with its help button. */
export const GameOptionLabel: FC<{ option: string; label: string; defaultValue?: number | string | boolean }> = (
  props
) => (
  <Stack direction="row" spacing={0.25} component="span" sx={{ alignItems: 'center' }}>
    <span>{props.label}</span>
    <GameOptionHint {...props} />
  </Stack>
);
