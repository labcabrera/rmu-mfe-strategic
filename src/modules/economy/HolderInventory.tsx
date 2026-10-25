import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import SellIcon from '@mui/icons-material/Sell';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Character,
  ItemAction,
  ItemInventory,
  RmuDialog,
  StrategicItem,
  updateCarriedStatus,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterItemModifiersDialog from '../characters/view/items/CharacterItemModifiersDialog';
import ItemLedgerList from './ItemLedgerList';
import { DiscardItemDialog, RepairItemDialog, SellItemDialog, TransferItemDialog } from './ItemOperationDialogs';
import { GOLD_COIN, HolderView } from './use-holder';

type Operation = 'sell' | 'transfer' | 'repair' | 'discard' | 'modifiers' | 'history';

export const isRepairable = (item: StrategicItem) =>
  !item.condition?.unrepairable && (!!item.condition?.broken || (item.condition?.breakagePenalty ?? 0) < 0);

/** Holder ids → names, for the ledger. */
export const holderNames = (view: HolderView): Record<string, string> => ({
  ...(view.faction ? { [view.faction.id]: view.faction.name } : {}),
  ...Object.fromEntries(view.members.map((member) => [member.id, member.name])),
  [view.holder.id]: view.name,
});

/**
 * The items of a character or of a faction armory (spec 023, decision 13) with the operations on each one: carry or
 * store (a character), give, sell, repair, modifiers, history and discard. The gold coins are shown apart.
 */
const HolderInventory: FC<{
  view: HolderView;
  /** An item changed: reload the holder (a character also reloads its equipment). */
  onChanged: (character?: Character) => void;
  equippedIds?: string[];
  emptyAction?: React.ReactNode;
}> = ({ view, onChanged, equippedIds, emptyAction }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [operation, setOperation] = useState<{ kind: Operation; item: StrategicItem }>();
  const close = () => setOperation(undefined);
  const done = () => {
    close();
    onChanged();
  };

  const toggleCarried = (item: StrategicItem) =>
    updateCarriedStatus(view.holder.id, item.id, !item.carried, auth)
      .then((character) => onChanged(character))
      .catch(notify.error);

  const actions = (item: StrategicItem): ItemAction[] => {
    const open = (kind: Operation) => () => setOperation({ kind, item });
    const equipped = equippedIds?.includes(item.id);
    return [
      ...(view.holder.kind === 'character'
        ? [
            {
              key: 'carry',
              label: t(item.carried ? 'store-item' : 'carry-item'),
              icon: item.carried ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />,
              onClick: toggleCarried,
              disabled: equipped,
            },
          ]
        : []),
      { key: 'transfer', label: t('transfer'), icon: <SwapHorizIcon fontSize="small" />, onClick: open('transfer') },
      { key: 'sell', label: t('sell'), icon: <SellIcon fontSize="small" />, onClick: open('sell'), disabled: equipped },
      {
        key: 'repair',
        label: t('repair'),
        icon: <BuildIcon fontSize="small" />,
        onClick: open('repair'),
        disabled: !isRepairable(item),
      },
      { key: 'modifiers', label: t('item-modifiers'), icon: <TuneIcon fontSize="small" />, onClick: open('modifiers') },
      { key: 'history', label: t('history'), icon: <HistoryIcon fontSize="small" />, onClick: open('history') },
      {
        key: 'discard',
        label: t('discard'),
        icon: <DeleteIcon fontSize="small" />,
        onClick: open('discard'),
        danger: true,
        disabled: equipped,
      },
    ];
  };

  const props = operation ? { item: operation.item, view, onClose: close, onDone: done } : undefined;

  return (
    <>
      <ItemInventory
        items={view.items}
        actions={actions}
        equippedIds={equippedIds}
        groupings={view.holder.kind === 'character' ? ['carried', 'category'] : ['category']}
        hideItemTypeIds={[GOLD_COIN]}
        emptyTitle={view.holder.kind === 'faction' ? t('armory-empty') : undefined}
        emptyAction={emptyAction}
      />
      {props && operation?.kind === 'sell' && <SellItemDialog {...props} />}
      {props && operation?.kind === 'transfer' && <TransferItemDialog {...props} />}
      {props && operation?.kind === 'repair' && <RepairItemDialog {...props} />}
      {props && operation?.kind === 'discard' && <DiscardItemDialog {...props} />}
      {operation?.kind === 'modifiers' && (
        <CharacterItemModifiersDialog
          open
          item={operation.item}
          onClose={() => done()}
          onChange={(item) => setOperation({ kind: 'modifiers', item })}
        />
      )}
      {operation?.kind === 'history' && (
        <RmuDialog open maxWidth="md" title={t('item-history', { name: operation.item.name })} onClose={close}>
          <ItemLedgerList rsql={`itemId==${operation.item.id}`} names={holderNames(view)} />
        </RmuDialog>
      )}
    </>
  );
};

export default HolderInventory;
