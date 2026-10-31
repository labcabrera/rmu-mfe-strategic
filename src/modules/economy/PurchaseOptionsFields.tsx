import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  catalogUnitValue,
  GEM_CUT_FACTORS,
  Item,
  ITEM_SIZES,
  ItemSize,
  JEWELRY_CLASSES,
  JewelryClass,
  MoneyDisplay,
  NumericInput,
  PurchaseItemOptions,
  SIZED_CATEGORIES,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const isSized = (item: Item) => (SIZED_CATEGORIES as readonly string[]).includes(item.category);
const isGem = (item: Item) => item.category === 'gem' || !!item.features?.gem;
const isJewel = (item: Item) => item.category === 'jewelry' && !!item.features?.jewelry;

/** Whether a catalog item takes instance data when it is bought (spec 062): a size, carats or a jewelry class. */
export const hasPurchaseOptions = (item: Item): boolean => isSized(item) || isGem(item) || isJewel(item);

/** The instance data a purchase starts with: one carat without a modern cut, a jewel of quality. */
export const defaultPurchaseOptions = (item: Item): PurchaseItemOptions | undefined => {
  if (isGem(item)) return { carats: 1, cutFactor: 1 };
  if (isJewel(item)) return { jewelryClass: 'quality' };
  return undefined;
};

/** A purchase can go ahead: a gem needs its carats. */
export const arePurchaseOptionsValid = (item: Item, options: PurchaseItemOptions | undefined): boolean =>
  !isGem(item) || (options?.carats ?? 0) > 0;

/** Size, carats and cut of a gem, class and base value of a jewel (spec 062); nothing for the other items. */
const PurchaseOptionsFields: FC<{
  item: Item;
  value: PurchaseItemOptions | undefined;
  onChange: (value: PurchaseItemOptions) => void;
}> = ({ item, value = {}, onChange }) => {
  const { t } = useTranslation();
  if (!hasPurchaseOptions(item)) return null;
  const set = (patch: PurchaseItemOptions) => onChange({ ...value, ...patch });
  const gem = isGem(item);
  const jewel = isJewel(item);
  const unit = gem || jewel ? catalogUnitValue(item, value) : null;
  const range = item.features?.jewelry?.value;
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {isSized(item) && (
          <TextField
            select
            size="small"
            label={t('item-size')}
            value={value.size ?? 'medium'}
            onChange={(e) => set({ size: e.target.value === 'medium' ? null : (e.target.value as ItemSize) })}
            sx={{ minWidth: 120, flex: 1 }}
          >
            {ITEM_SIZES.map((size) => (
              <MenuItem key={size} value={size}>
                {t(`item-size-${size}`)}
              </MenuItem>
            ))}
          </TextField>
        )}
        {gem && (
          <>
            <NumericInput
              label={t('gem-carats')}
              value={value.carats ?? null}
              onChange={(carats) => set({ carats })}
              min={0}
              maxFractionDigits={2}
              error={!value.carats}
            />
            <TextField
              select
              size="small"
              label={t('gem-cut')}
              value={value.cutFactor ?? 1}
              onChange={(e) => set({ cutFactor: Number(e.target.value) })}
              sx={{ minWidth: 120, flex: 1 }}
            >
              {GEM_CUT_FACTORS.map((factor) => (
                <MenuItem key={factor} value={factor}>
                  {factor === 1 ? t('gem-cut-none') : t('gem-cut-factor-value', { value: factor })}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}
        {jewel && (
          <>
            <TextField
              select
              size="small"
              label={t('jewelry-class')}
              value={value.jewelryClass ?? 'quality'}
              onChange={(e) => set({ jewelryClass: e.target.value as JewelryClass })}
              sx={{ minWidth: 140, flex: 1 }}
            >
              {JEWELRY_CLASSES.map((jewelryClass) => (
                <MenuItem key={jewelryClass} value={jewelryClass}>
                  {t(`jewelry-class-${jewelryClass}`)}
                </MenuItem>
              ))}
            </TextField>
            <NumericInput
              label={t('jewelry-base-value')}
              placeholder={range ? `${range.min}-${range.max}${range.openEnded ? '+' : ''}` : undefined}
              value={value.value ?? null}
              onChange={(base) => set({ value: base })}
              min={0}
              maxFractionDigits={2}
            />
          </>
        )}
      </Stack>
      {jewel && !value.value && (
        <Typography variant="caption" color="text.secondary">
          {t('jewelry-value-rolled-hint')}
        </Typography>
      )}
      {unit !== null && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t(jewel && !value.value ? 'unit-value-indicative' : 'unit-value')}
          </Typography>
          <MoneyDisplay gold={unit} variant="caption" />
        </Stack>
      )}
    </Stack>
  );
};

export default PurchaseOptionsFields;
