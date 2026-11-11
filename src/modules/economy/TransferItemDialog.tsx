import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { Button, Stack } from '@mui/material';
import {
  characterOption,
  CharacterPicker,
  ItemHolder,
  itemUnits,
  RmuDialog,
  transferItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useBusyAction } from '../shared/useBusyAction';
import { AmountField, DialogProps, partialAmount } from './item-operation-common';

/** Gives an item to another character of the faction, or between a character and the armory (decision 9). */
export const TransferItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | null>(itemUnits(item));
  const { busy, run } = useBusyAction();
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
    run(transferItem(item.id, { to, amount: partialAmount(item, amount) }, auth), onDone);
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
