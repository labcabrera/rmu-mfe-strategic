import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  CharacterPicker,
  coatItem,
  COATING_FORMS,
  characterOption,
  ConfirmDialog,
  discardItem,
  ItemConditionChip,
  ItemHolder,
  ItemOperationResult,
  itemUnits,
  MoneyDisplay,
  NumericInput,
  PriceBreakdownView,
  removeItemCoating,
  repairItem,
  RmuDialog,
  sellItem,
  StrategicItem,
  TradingRequest,
  transferItem,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import ItemLedgerOutcome from './ItemLedgerOutcome';
import ManeuverFields, { defaultSkillKey, emptyManeuver, isManeuverReady, toManeuverDto } from './ManeuverFields';
import { TradingFields, usePriceQuote } from './TradingFields';
import { HolderView } from './use-holder';

/** Crafting skills offered first to craft or repair (spec 023, decisions 10 and 11). */
export const CRAFT_SKILLS = ['crafting', 'metalcraft', 'woodcraft', 'leathercraft', 'stonecraft', 'fabric-craft'];

/** Penalty of a repair roll: the damage of the item, or −100 when it is broken. */
export const repairPenalty = (item: StrategicItem) =>
  item.condition?.broken ? -100 : (item.condition?.breakagePenalty ?? 0);

const AmountField: FC<{ item: StrategicItem; value: number | null; onChange: (value: number | null) => void }> = ({
  item,
  value,
  onChange,
}) => {
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
const partialAmount = (item: StrategicItem, amount: number | null) =>
  item.info?.stackable && amount !== null && amount < itemUnits(item) ? amount : undefined;

type DialogProps = {
  item: StrategicItem;
  view: HolderView;
  onClose: () => void;
  /** The operation is done; no result for the ones without a ledger entry (removing a coating). */
  onDone: (result?: ItemOperationResult) => void;
};

/** Sells an item at the market (spec 023, decision 12): its value by its condition and the sale percent. */
export const SellItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [amount, setAmount] = useState<number | null>(itemUnits(item));
  const [salePercent, setSalePercent] = useState<number | null>(null);
  const [trading, setTrading] = useState<TradingRequest>();
  const [busy, setBusy] = useState(false);
  const dto = {
    amount: partialAmount(item, amount),
    ...(salePercent !== null ? { salePercent } : {}),
    ...(trading ? { trading } : {}),
  };
  const { quote, error } = usePriceQuote(
    amount && amount > 0 ? { kind: 'sale', itemId: item.id, holder: view.holder, ...dto } : undefined
  );

  const onSell = () => {
    setBusy(true);
    sellItem(item.id, dto, auth)
      .then(onDone)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open
      title={t('sell-item', { name: item.name })}
      onCancel={onClose}
      buttons={
        <Button variant="contained" disabled={!quote || busy} onClick={onSell}>
          {t('sell')}
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('condition')}
          </Typography>
          <ItemConditionChip condition={item.condition} />
        </Stack>
        <AmountField item={item} value={amount} onChange={setAmount} />
        <NumericInput
          label={t('price-sale-percent-override')}
          placeholder={quote ? `${quote.rules.salePercent}` : undefined}
          value={salePercent}
          onChange={setSalePercent}
          min={0}
          max={200}
          integer
        />
        <TradingFields character={view.character} onChange={setTrading} />
        {quote && <PriceBreakdownView price={quote.price} funds={{ label: t('price-funds-after'), gold: view.gold }} />}
        {!!error && <Alert severity="warning">{t('price-quote-unavailable')}</Alert>}
      </Stack>
    </RmuDialog>
  );
};

/** Gives an item to another character of the faction, or between a character and the armory (decision 9). */
export const TransferItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [amount, setAmount] = useState<number | null>(itemUnits(item));
  const [busy, setBusy] = useState(false);
  const targets = useMemo<{ key: string; holder: ItemHolder; label: string }[]>(() => {
    const faction = view.faction
      ? [
          {
            key: `faction:${view.faction.id}`,
            holder: { kind: 'faction' as const, id: view.faction.id },
            label: t('armory-of', { name: view.faction.name }),
          },
        ]
      : [];
    const characters = view.members.map((member) => ({
      key: `character:${member.id}`,
      holder: { kind: 'character' as const, id: member.id },
      label: member.name,
    }));
    return [...faction, ...characters].filter(
      (target) => target.holder.kind !== view.holder.kind || target.holder.id !== view.holder.id
    );
  }, [view]);
  const [target, setTarget] = useState(targets[0]?.key ?? '');

  const onTransfer = () => {
    const to = targets.find((option) => option.key === target)?.holder;
    if (!to) return;
    setBusy(true);
    transferItem(item.id, { to, amount: partialAmount(item, amount) }, auth)
      .then(onDone)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open
      title={t('transfer-item', { name: item.name })}
      onCancel={onClose}
      buttons={
        <Button variant="contained" disabled={!target || !amount || busy} onClick={onTransfer}>
          {t('transfer')}
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <CharacterPicker
          label={t('transfer-to')}
          options={targets
            .filter((option) => option.holder.kind === 'character')
            .map((option) => {
              const member = view.members.find((each) => each.id === option.holder.id)!;
              return characterOption(member, { id: option.key });
            })}
          extraOptions={targets
            .filter((option) => option.holder.kind === 'faction')
            .map((option) => ({ id: option.key, name: option.label, icon: <WarehouseIcon /> }))}
          relation="friends"
          factionId={view.faction?.id}
          value={target}
          onChange={(key) => key && setTarget(key)}
        />
        <AmountField item={item} value={amount} onChange={setAmount} />
      </Stack>
    </RmuDialog>
  );
};

/** Throws an item away, after a confirmation: it leaves an entry in the ledger. */
export const DiscardItemDialog: FC<DialogProps> = ({ item, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [amount, setAmount] = useState<number | null>(itemUnits(item));
  const [confirm, setConfirm] = useState(false);

  const onDiscard = () =>
    discardItem(item.id, { amount: partialAmount(item, amount) }, auth)
      .then(onDone)
      .catch(notify.error);

  if (confirm || !item.info?.stackable) {
    return (
      <ConfirmDialog
        open
        destructive
        title={t('discard-item')}
        message={t('discard-item-confirm', { name: item.name, amount: amount ?? itemUnits(item) })}
        confirmLabel={t('discard')}
        onConfirm={onDiscard}
        onClose={onClose}
      />
    );
  }
  return (
    <RmuDialog
      open
      title={t('discard-item')}
      onCancel={onClose}
      buttons={
        <Button color="error" variant="contained" disabled={!amount} onClick={() => setConfirm(true)}>
          {t('discard')}
        </Button>
      }
    >
      <Stack sx={{ pt: 1 }}>
        <AmountField item={item} value={amount} onChange={setAmount} />
      </Stack>
    </RmuDialog>
  );
};

/**
 * Repairs a damaged or broken item (decision 11): a craftsman of the faction rolls with the damage of the item as a
 * penalty, and the outcome of the repair table changes its breakage. The cost is optional.
 */
export const RepairItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const craftsmen = view.members;
  const [actorId, setActorId] = useState(view.character?.id ?? craftsmen[0]?.id ?? '');
  const actor = craftsmen.find((member) => member.id === actorId) ?? view.character;
  const [maneuver, setManeuver] = useState(emptyManeuver(defaultSkillKey(actor, CRAFT_SKILLS), 'm'));
  const [cost, setCost] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ItemOperationResult>();

  const onRepair = () => {
    setBusy(true);
    repairItem(
      item.id,
      { maneuver: { ...toManeuverDto(maneuver), ...(actorId ? { actorId } : {}) }, ...(cost ? { cost } : {}) },
      auth
    )
      .then(setResult)
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  if (result) {
    return (
      <RmuDialog open title={t('repair-item', { name: item.name })} onClose={() => onDone(result)}>
        <ItemLedgerOutcome entry={result.entry} item={result.item} />
      </RmuDialog>
    );
  }

  return (
    <RmuDialog
      open
      maxWidth="md"
      title={t('repair-item', { name: item.name })}
      onCancel={onClose}
      buttons={
        <Button variant="contained" disabled={!isManeuverReady(actor, maneuver) || busy} onClick={onRepair}>
          {t('repair')}
        </Button>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('condition')}
          </Typography>
          <ItemConditionChip condition={item.condition} />
        </Stack>
        <CharacterPicker
          label={t('craftsman')}
          options={craftsmen.map((member) => characterOption(member))}
          relation="friends"
          factionId={view.faction?.id}
          value={actorId}
          onChange={(id) => {
            if (!id) return;
            setActorId(id);
            const next = craftsmen.find((member) => member.id === id);
            setManeuver({ ...maneuver, skillKey: defaultSkillKey(next, CRAFT_SKILLS) });
          }}
        />
        <ManeuverFields
          character={actor}
          value={maneuver}
          onChange={setManeuver}
          preferred={CRAFT_SKILLS}
          showDifficulty
          extra={{ label: t('repair-damage-penalty'), value: repairPenalty(item) }}
        />
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <NumericInput label={t('repair-cost')} value={cost} onChange={setCost} min={0} maxFractionDigits={3} />
          {!!cost && <MoneyDisplay gold={cost} />}
        </Stack>
      </Stack>
    </RmuDialog>
  );
};

/** Poisons of the holder that coat a weapon: liquids and pastes (spec 042). */
export const coatingPoisons = (items: StrategicItem[]): StrategicItem[] =>
  items.filter((item) => {
    const poison = item.catalog?.features?.poison;
    return !!poison && COATING_FORMS.includes(poison.form) && itemUnits(item) > 0;
  });

/**
 * Coats a weapon with a dose of a liquid or paste poison of its holder (spec 042), or wipes the poison it has. The
 * next hit in a tactical game spends it.
 */
export const CoatItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [poisonItemId, setPoisonItemId] = useState('');
  const poisons = coatingPoisons(view.items);

  if (item.coating) {
    return (
      <ConfirmDialog
        open
        title={t('remove-coating')}
        message={t('remove-coating-confirm', { name: item.name, poison: t(item.coating.name, item.coating.name) })}
        confirmLabel={t('remove-coating')}
        onConfirm={() =>
          removeItemCoating(item.id, auth)
            .then(() => onDone())
            .catch(notify.error)
        }
        onClose={onClose}
      />
    );
  }

  const onCoat = () => coatItem(item.id, poisonItemId, auth).then(onDone).catch(notify.error);

  return (
    <RmuDialog
      open
      title={t('coat-item', { name: item.name })}
      onCancel={onClose}
      onConfirm={onCoat}
      onConfirmDisabled={!poisonItemId}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {poisons.length === 0 ? (
          <Alert severity="info">{t('coat-item-no-poisons')}</Alert>
        ) : (
          <TextField
            select
            size="small"
            label={t('poison')}
            value={poisonItemId}
            onChange={(e) => setPoisonItemId(e.target.value)}
          >
            {poisons.map((poison) => (
              <MenuItem key={poison.id} value={poison.id}>
                {`${t(poison.name, poison.name)} · ${t(`poison-form-${poison.catalog!.features!.poison!.form}`)} (${itemUnits(poison)})`}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Typography variant="caption" color="text.secondary">
          {t('coat-item-help')}
        </Typography>
      </Stack>
    </RmuDialog>
  );
};
