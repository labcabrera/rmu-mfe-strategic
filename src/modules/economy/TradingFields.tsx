/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import {
  Character,
  CharacterPicker,
  characterOption,
  fetchManeuverModifiers,
  fetchTradingTables,
  formatPriceFactorValue,
  isApiError,
  ManeuverModifier,
  ModifierSelections,
  ModifierSelectionValues,
  NumericInput,
  PriceFactor,
  PriceFactorSelection,
  PriceQuote,
  QuotePriceDto,
  quoteItemPrice,
  selectedPriceFactors,
  selectedRollModifiers,
  TradingRequest,
  TradingTables,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import ManeuverFields, { emptyManeuver, maneuverBonus, ManeuverValue, skillKeyOf } from './ManeuverFields';

export const TRADING_SKILL = 'trading';

export type TradingContext = 'purchase' | 'sale';

// The tables only change with an import: one request per page load
let tablesRequest: Promise<TradingTables | null> | undefined;

/**
 * The trading tables of core (spec 048), or null when they have not been imported: then the market uses the Core
 * Law rule and has no market conditions.
 */
export function useTradingTables(): { tables: TradingTables | null | undefined } {
  const auth = useAuth();
  const [tables, setTables] = useState<TradingTables | null>();
  useEffect(() => {
    tablesRequest ??= fetchTradingTables(auth).catch((e) => {
      if (isApiError(e) && (e.status === 404 || e.status === 403)) return null;
      tablesRequest = undefined;
      throw e;
    });
    let active = true;
    tablesRequest.then((value) => active && setTables(value)).catch(() => active && setTables(null));
    return () => {
      active = false;
    };
  }, []);
  return { tables };
}

/** The market conditions of a side of the deal. */
export const contextFactors = (tables: TradingTables | null | undefined, context: TradingContext): PriceFactor[] =>
  (tables?.priceFactors ?? []).filter((factor) => !factor.contexts?.length || factor.contexts.includes(context));

/**
 * Market conditions of the expected price (spec 048, Treasure Law table 4-3a): one chip or field per condition of the
 * side of the deal. `onChange` gets the chosen values; `marketFactors` turns them into the request.
 */
export const MarketConditions: FC<{
  context: TradingContext;
  value: ModifierSelectionValues;
  onChange: (value: ModifierSelectionValues) => void;
}> = ({ context, value, onChange }) => {
  const { t } = useTranslation();
  const { tables } = useTradingTables();
  const factors = contextFactors(tables, context);
  if (tables === undefined) return null;
  if (!tables) return <Alert severity="info">{t('market-conditions-unavailable')}</Alert>;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('market-conditions')}</Typography>
      <Typography variant="caption" color="text.secondary">
        {t('market-conditions-hint')}
      </Typography>
      <ModifierSelections
        modifiers={factors}
        value={value}
        onChange={onChange}
        label={(key) => t(`price-factor-${key}`)}
        optionLabel={(key, option) => t(`price-factor-${key}.${option}`)}
        formatValue={(amount, factor) => formatPriceFactorValue((factor as PriceFactor).mode, amount)}
      />
    </Stack>
  );
};

/** The chosen market conditions as the factors of a request. */
export const marketFactors = (
  tables: TradingTables | null | undefined,
  context: TradingContext,
  value: ModifierSelectionValues
): PriceFactorSelection[] => selectedPriceFactors(contextFactors(tables, context), value);

/** What the Trading block holds; the parent keeps it so it survives the steps of the checkout. */
export type TradingValue = {
  enabled: boolean;
  /** Faction market: the character that negotiates (its Trading skill). */
  negotiatorId: string | null;
  maneuver: ManeuverValue;
  /** Modifiers of core for Trading (reputation, language, perishable...). */
  modifiers: ModifierSelectionValues;
  /** d100 + Trading of the merchant: the active side gets 100 less it. */
  merchantTotal: number | null;
};

export const emptyTrading = (character?: Character, enabled = false): TradingValue => {
  const skill = character?.skills.find((s) => s.skillId === TRADING_SKILL);
  return {
    enabled,
    negotiatorId: null,
    maneuver: emptyManeuver(skill ? skillKeyOf(skill) : ''),
    modifiers: {},
    merchantTotal: null,
  };
};

/** The character whose Trading is used: the one of the market, or the negotiator of a faction. */
export const negotiatorOf = (value: TradingValue, character: Character | undefined, members: Character[] = []) =>
  character ?? members.find((member) => member.id === value.negotiatorId);

const modifiersFor = (modifiers: ManeuverModifier[], context: TradingContext) =>
  modifiers.filter(
    (modifier) => !modifier.reference && (!modifier.scope.contexts?.length || modifier.scope.contexts.includes(context))
  );

/**
 * The request of the Trading block, or undefined while it is off or incomplete. The bonus always goes in the
 * request, because the negotiator of a faction is not the buyer.
 */
export const tradingRequest = (
  value: TradingValue,
  negotiator: Character | undefined,
  modifiers: ManeuverModifier[],
  context: TradingContext
): TradingRequest | undefined => {
  const bonus = maneuverBonus(negotiator, value.maneuver);
  if (!value.enabled || value.maneuver.roll === null || bonus === undefined) return undefined;
  const rollModifiers = [
    ...selectedRollModifiers(modifiersFor(modifiers, context), value.modifiers),
    ...(value.merchantTotal !== null ? [{ key: 'merchant', value: 100 - value.merchantTotal }] : []),
    ...(value.maneuver.modifier ? [{ key: 'custom', value: value.maneuver.modifier }] : []),
  ];
  return {
    roll: value.maneuver.roll,
    ...(value.maneuver.unmodifiedRoll !== undefined ? { unmodifiedRoll: value.maneuver.unmodifiedRoll } : {}),
    bonus,
    ...(rollModifiers.length ? { modifiers: rollModifiers } : {}),
  };
};

/** The Trading modifiers of core (spec 010 and 048), loaded once. */
export function useTradingModifiers(): ManeuverModifier[] {
  const auth = useAuth();
  const [modifiers, setModifiers] = useState<ManeuverModifier[]>([]);
  useEffect(() => {
    fetchManeuverModifiers(TRADING_SKILL, auth)
      .then(setModifiers)
      .catch(() => setModifiers([]));
  }, []);
  return modifiers;
}

/**
 * Trading maneuver of a purchase or a sale (spec 023, decision 12; spec 048): the negotiator (a member, in a faction
 * market), its roll and bonus, the modifiers of core for Trading and the total of the merchant, which the active side
 * gets as 100 less it. With `alwaysOn` there is no switch (a negotiated purchase).
 */
export const TradingFields: FC<{
  character?: Character;
  /** Faction market: the members that can negotiate. */
  members?: Character[];
  factionId?: string;
  context: TradingContext;
  modifiers: ManeuverModifier[];
  value: TradingValue;
  onChange: (value: TradingValue) => void;
  alwaysOn?: boolean;
}> = ({ character, members = [], factionId, context, modifiers, value, onChange, alwaysOn }) => {
  const { t } = useTranslation();
  const { tables } = useTradingTables();
  const negotiator = negotiatorOf(value, character, members);
  const available = useMemo(() => modifiersFor(modifiers, context), [modifiers, context]);

  const setNegotiator = (id: string | null) => {
    const member = members.find((m) => m.id === id);
    onChange({ ...emptyTrading(member, value.enabled), modifiers: value.modifiers, negotiatorId: id });
  };

  return (
    <Stack spacing={1.5}>
      {!alwaysOn && (
        <FormControlLabel
          control={<Switch checked={value.enabled} onChange={(event) => onChange({ ...value, enabled: event.target.checked })} />}
          label={t('trading-maneuver')}
        />
      )}
      {(alwaysOn || value.enabled) && (
        <>
          <Typography variant="caption" color="text.secondary">
            {tables ? t('trading-negotiation-hint') : t('trading-maneuver-hint')}
          </Typography>
          {!character && members.length > 0 && (
            <CharacterPicker
              label={t('trading-negotiator')}
              options={members.map((member) => characterOption(member))}
              relation="friends"
              factionId={factionId}
              value={value.negotiatorId}
              onChange={setNegotiator}
              clearable
            />
          )}
          <ManeuverFields
            character={negotiator}
            value={value.maneuver}
            onChange={(maneuver) => onChange({ ...value, maneuver })}
            preferred={[TRADING_SKILL]}
          />
          <Box sx={{ maxWidth: 260 }}>
            <NumericInput
              label={t('trading-merchant-total')}
              value={value.merchantTotal}
              onChange={(merchantTotal) => onChange({ ...value, merchantTotal })}
              integer
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {value.merchantTotal !== null
              ? t('trading-merchant-modifier', { value: 100 - value.merchantTotal })
              : t('trading-merchant-hint')}
          </Typography>
          {available.length > 0 && (
            <ModifierSelections
              modifiers={available}
              value={value.modifiers}
              onChange={(selected) => onChange({ ...value, modifiers: selected })}
            />
          )}
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
