import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  changeCharges,
  ConfirmDialog,
  cutGem,
  EmptyState,
  GEM_MODERN_CUT_FACTORS,
  GemCutFactor,
  GemTraits,
  ItemEnchantmentInfo,
  KeyValueList,
  KeyValueRow,
  MagicItemInfo,
  MoneyDisplay,
  rechargeItem,
  RmuDialog,
  roundGold,
  setGem,
  StrategicItem,
  unsetGem,
  itemName,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../services/notify-service';
import { HolderView } from './use-holder';

// Magic items, charges and gems of an owned item (workspace spec 067, decisions 8, 18 and 19).

/** Recharge price of rmu-api-strategic: 2 sp per day, one day per level of its highest spell (Charged Items, 3.3). */
const RECHARGE_SP_PER_DAY = 2;
/** Fee of a lapidary for a modern cut: 10 % of the new value. */
const GEM_CUT_FEE = 0.1;

export const isGem = (item: StrategicItem) => item.category === 'gem';

/** A gem without a modern cut yet: only those can be cut. */
export const isUncutGem = (item: StrategicItem) => isGem(item) && (item.cutFactor ?? null) === null;

/** The loose gems of the holder that can be set in this item. */
export const settableGems = (view: HolderView, item: StrategicItem) =>
  view.items.filter((each) => isGem(each) && each.id !== item.id);

export const rechargeDays = (item: StrategicItem): number => {
  const spells = item.enchantment?.spells ?? [];
  const level = spells.length ? Math.max(...spells.map((spell) => spell.level)) : (item.enchantment?.itemLevel ?? 0);
  return Math.max(1, level);
};

type Props = {
  item: StrategicItem;
  onClose: () => void;
  /** The item changed: the dialog keeps showing the new one and the holder reloads. */
  onChange: (item: StrategicItem) => void;
};

/**
 * The enchantment of an item (alchemy, catalog, treasure or manual) with its charges: spend one, or recharge it with
 * its cost charged to the holder.
 */
export const ItemMagicDialog: FC<Props> = ({ item, onClose, onChange }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [confirmRecharge, setConfirmRecharge] = useState(false);
  const [busy, setBusy] = useState(false);
  const charges = item.charges ?? null;
  const alchemy = !!item.enchantment && (!item.enchantment.source || item.enchantment.source === 'alchemy');
  const days = rechargeDays(item);

  const run = (call: Promise<StrategicItem>) => {
    setBusy(true);
    call
      .then(onChange)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  const chargeRows: KeyValueRow[] =
    charges && (alchemy || !item.enchantment)
      ? [
          {
            label: t('magic-charges'),
            value: t('magic-charges-value', { current: charges.current, max: charges.max }),
            tone: charges.current === 0 ? 'danger' : 'default',
          },
        ]
      : [];

  return (
    <>
      <RmuDialog
        open
        maxWidth="sm"
        title={t(alchemy ? 'item-enchantment' : 'item-magic')}
        subtitle={itemName(item, t)}
        onClose={onClose}
        buttons={
          charges && (
            <>
              <Button
                disabled={busy || charges.current <= 0}
                onClick={() => run(changeCharges(item.id, { delta: -1 }, auth))}
              >
                {t('magic-spend-charge')}
              </Button>
              <Button
                variant="contained"
                disabled={busy || charges.current >= charges.max}
                onClick={() => setConfirmRecharge(true)}
              >
                {t('magic-recharge')}
              </Button>
            </>
          )
        }
      >
        <Stack spacing={1.5}>
          {alchemy ? (
            <ItemEnchantmentInfo item={item} bare />
          ) : (
            <MagicItemInfo enchantment={item.enchantment} charges={charges} bare />
          )}
          {chargeRows.length > 0 && <KeyValueList rows={chargeRows} />}
        </Stack>
      </RmuDialog>
      {confirmRecharge && charges && (
        <ConfirmDialog
          open
          title={t('magic-recharge')}
          message={
            <Stack spacing={1}>
              <span>{t('magic-recharge-confirm', { name: item.name, max: charges.max })}</span>
              <KeyValueList
                dense
                rows={[
                  { label: t('magic-recharge-days'), hint: t('magic-recharge-cost-note'), value: days },
                  {
                    label: t('magic-recharge-cost'),
                    value: <MoneyDisplay gold={roundGold((RECHARGE_SP_PER_DAY * days) / 10)} />,
                  },
                ]}
              />
            </Stack>
          }
          confirmLabel={t('magic-recharge')}
          onConfirm={() => {
            setConfirmRecharge(false);
            run(rechargeItem(item.id, auth));
          }}
          onClose={() => setConfirmRecharge(false)}
        />
      )}
    </>
  );
};

const gemRows = (item: StrategicItem, t: ReturnType<typeof useTranslation>['t']): KeyValueRow[] => [
  ...(item.carats !== null && item.carats !== undefined
    ? [{ label: t('gem-carats'), value: t('gem-carats-value', { count: item.carats }) }]
    : []),
  {
    label: t('gem-cut'),
    value:
      item.cutFactor && item.cutFactor > 1 ? t('gem-cut-factor-value', { value: item.cutFactor }) : t('gem-cut-none'),
  },
  ...(item.value !== undefined ? [{ label: t('value'), value: <MoneyDisplay gold={item.value} /> }] : []),
];

/** A gem: its carats, cut, value and magic traits (Treasure Law table 2-4f). */
export const GemDialog: FC<Omit<Props, 'onChange'>> = ({ item, onClose }) => {
  const { t } = useTranslation();
  const gem = item.catalog?.features?.gem;
  return (
    <RmuDialog open maxWidth="sm" title={t('gem-traits')} subtitle={itemName(item, t)} onClose={onClose}>
      <Stack spacing={1.5}>
        <KeyValueList rows={gemRows(item, t)} />
        {gem?.magic ? <GemTraits gem={gem} bare dense /> : <EmptyState dense title={t('gem-traits-none')} />}
      </Stack>
    </RmuDialog>
  );
};

/** A modern cut of a gem (×5 or ×10 of its value), with the fee of the lapidary charged to the holder. */
export const CutGemDialog: FC<Props> = ({ item, onClose, onChange }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [factor, setFactor] = useState<GemCutFactor>(GEM_MODERN_CUT_FACTORS[0]);
  const [busy, setBusy] = useState(false);
  const newValue = item.value !== undefined ? roundGold(item.value * factor) : null;

  const onCut = () => {
    setBusy(true);
    cutGem(item.id, factor, auth)
      .then(onChange)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open
      maxWidth="xs"
      title={t('gem-cut-action')}
      subtitle={itemName(item, t)}
      onCancel={onClose}
      buttons={
        <Button variant="contained" disabled={busy} onClick={onCut}>
          {t('gem-cut-action')}
        </Button>
      }
    >
      <Stack spacing={1.5} sx={{ pt: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={factor}
          onChange={(_, value: GemCutFactor | null) => value && setFactor(value)}
        >
          {GEM_MODERN_CUT_FACTORS.map((each) => (
            <ToggleButton key={each} value={each}>
              {t('gem-cut-factor-value', { value: each })}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {newValue !== null && (
          <KeyValueList
            rows={[
              { label: t('gem-cut-new-value'), value: <MoneyDisplay gold={roundGold(newValue * item.amount)} /> },
              {
                label: t('gem-cut-fee'),
                hint: t('gem-cut-fee-hint'),
                value: <MoneyDisplay gold={roundGold(newValue * item.amount * GEM_CUT_FEE)} />,
              },
            ]}
          />
        )}
      </Stack>
    </RmuDialog>
  );
};

/** The gems set in an item, with their traits: set a loose gem of the same holder, or take one out. */
export const GemSettingsDialog: FC<Props & { view: HolderView }> = ({ item, view, onClose, onChange }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [gemId, setGemId] = useState('');
  const [busy, setBusy] = useState(false);
  const settings = item.settings ?? [];
  const gems = settableGems(view, item);

  const run = (call: Promise<StrategicItem>) => {
    setBusy(true);
    call
      .then((updated) => {
        setGemId('');
        onChange(updated);
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog open maxWidth="sm" title={t('gem-settings')} subtitle={itemName(item, t)} onClose={onClose}>
      <Stack spacing={1.5}>
        {settings.length === 0 ? (
          <EmptyState dense title={t('gem-settings-empty')} />
        ) : (
          settings.map((setting, index) => (
            <GemTraits
              key={`${setting.itemTypeId}-${setting.setAt}`}
              setting={setting}
              dense
              extra={
                <Button size="small" disabled={busy} onClick={() => run(unsetGem(item.id, index, auth))}>
                  {t('gem-unset')}
                </Button>
              }
            />
          ))
        )}
        {gems.length === 0 ? (
          <EmptyState dense title={t('gem-set-no-gems')} />
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              select
              size="small"
              fullWidth
              label={t('gem-set-choose')}
              value={gemId}
              onChange={(event) => setGemId(event.target.value)}
            >
              {gems.map((gem) => (
                <MenuItem key={gem.id} value={gem.id}>
                  {gem.carats ? `${gem.name} · ${t('gem-carats-value', { count: gem.carats })}` : gem.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              disabled={busy || !gemId}
              onClick={() => run(setGem(item.id, gemId, auth))}
              sx={{ flexShrink: 0 }}
            >
              {t('gem-set')}
            </Button>
          </Stack>
        )}
      </Stack>
    </RmuDialog>
  );
};
