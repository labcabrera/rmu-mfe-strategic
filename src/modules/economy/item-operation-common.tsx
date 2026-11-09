import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ItemOperationResult,
  itemUnits,
  NumericInput,
  StrategicItem,
  COATING_FORMS,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { HolderView } from './use-holder';

/** Crafting skills offered first to craft or repair (spec 023, decisions 10 and 11). */
export const CRAFT_SKILLS = ['crafting', 'metalcraft', 'woodcraft', 'leathercraft', 'stonecraft', 'fabric-craft'];

export const AmountField: FC<{
  item: StrategicItem;
  value: number | null;
  onChange: (value: number | null) => void;
}> = ({ item, value, onChange }) => {
  const { t } = useTranslation();
  if (!item.info?.stackable) return null;
  return (
    <NumericInput
      label={`${t('amount')} (${t('max')} ${itemUnits(item)})`}
      value={value}
      onChange={onChange}
      min={0}
      max={itemUnits(item)}
      maxFractionDigits={3}
    />
  );
};

/** The amount to send: none for a whole item or a whole stack. */
export const partialAmount = (item: StrategicItem, amount: number | null) =>
  item.info?.stackable && amount !== null && amount < itemUnits(item) ? amount : undefined;

export type DialogProps = {
  item: StrategicItem;
  view: HolderView;
  onClose: () => void;
  /** The operation is done; no result for the ones without a ledger entry (removing a coating). */
  onDone: (result?: ItemOperationResult) => void;
};

/** Poisons of the holder that coat a weapon: liquids and pastes (spec 042). */
export const coatingPoisons = (items: StrategicItem[]): StrategicItem[] =>
  items.filter((item) => {
    const poison = item.catalog?.features?.poison;
    return !!poison && COATING_FORMS.includes(poison.form) && itemUnits(item) > 0;
  });
