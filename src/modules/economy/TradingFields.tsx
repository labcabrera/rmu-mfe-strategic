/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import {
  Character,
  PriceQuote,
  QuotePriceDto,
  quoteItemPrice,
  TradingRequest,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import ManeuverFields, { emptyManeuver, isManeuverReady, ManeuverValue, skillKeyOf } from './ManeuverFields';

export const TRADING_SKILL = 'trading';

/**
 * Optional Trading maneuver of a purchase or a sale (spec 023, decision 12): the roll of the character, with its
 * Trading bonus, and the Trading of the merchant as a negative modifier. `onChange` gets the request, or undefined
 * while it is off or incomplete.
 */
export const TradingFields: FC<{
  character?: Character;
  onChange: (trading: TradingRequest | undefined) => void;
}> = ({ character, onChange }) => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const tradingSkill = character?.skills.find((skill) => skill.skillId === TRADING_SKILL);
  const [value, setValue] = useState<ManeuverValue>(emptyManeuver(tradingSkill ? skillKeyOf(tradingSkill) : ''));

  useEffect(() => {
    if (!enabled || !isManeuverReady(character, value) || value.roll === null) return onChange(undefined);
    onChange({
      roll: value.roll,
      ...(value.unmodifiedRoll !== undefined ? { unmodifiedRoll: value.unmodifiedRoll } : {}),
      // The API reads the Trading of the sheet: a typed bonus, or another skill, goes as the bonus.
      ...(value.bonus !== null || !value.skillKey.startsWith(`${TRADING_SKILL}::`)
        ? { bonus: value.bonus ?? character?.skills.find((s) => skillKeyOf(s) === value.skillKey)?.totalBonus ?? 0 }
        : {}),
      ...(value.modifier ? { modifiers: [{ key: 'merchant', value: value.modifier }] } : {}),
    });
  }, [enabled, value]);

  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={<Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />}
        label={t('trading-maneuver')}
      />
      {enabled && (
        <>
          <Typography variant="caption" color="text.secondary">
            {t('trading-maneuver-hint')}
          </Typography>
          <ManeuverFields character={character} value={value} onChange={setValue} preferred={[TRADING_SKILL]} />
        </>
      )}
    </Stack>
  );
};

/** A price quote of the API, asked again when the request changes. */
export function usePriceQuote(dto: QuotePriceDto | undefined) {
  const auth = useAuth();
  const [quote, setQuote] = useState<PriceQuote>();
  const [error, setError] = useState<unknown>();
  const key = JSON.stringify(dto ?? null);

  useEffect(() => {
    if (!dto) {
      setQuote(undefined);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      quoteItemPrice(dto, auth)
        .then((data) => active && (setQuote(data), setError(undefined)))
        .catch((e) => active && (setQuote(undefined), setError(e)));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);

  return { quote, error };
}
