import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteIcon from '@mui/icons-material/Delete';
import DiamondIcon from '@mui/icons-material/Diamond';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import SellIcon from '@mui/icons-material/Sell';
import SpaIcon from '@mui/icons-material/Spa';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Character,
  ItemAction,
  ItemInventory,
  isHealingHerb,
  RmuDialog,
  StrategicItem,
  updateCarriedStatus,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import UseHerbDialog from '../characters/view/health/UseHerbDialog';
import CharacterItemModifiersDialog from '../characters/view/items/CharacterItemModifiersDialog';
import ItemLedgerList from './ItemLedgerList';
import {
  CutGemDialog,
  GemDialog,
  GemSettingsDialog,
  isGem,
  isUncutGem,
  ItemMagicDialog,
  settableGems,
} from './ItemMagicDialogs';
import {
  CoatItemDialog,
  DiscardItemDialog,
  RepairItemDialog,
  SellItemDialog,
  TransferItemDialog,
} from './ItemOperationDialogs';
import { GOLD_COIN, HolderView } from './use-holder';

type Operation =
  | 'sell'
  | 'transfer'
  | 'repair'
  | 'coat'
  | 'discard'
  | 'modifiers'
  | 'history'
  | 'use-herb'
  | 'magic'
  | 'gem'
  | 'cut'
  | 'settings';

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
 * store (a character), use a healing herb (spec 062), give, sell, repair, poison a weapon (spec 042), the magic and
 * charges of an item, cut a gem or set gems in an item (spec 067), modifiers, history and discard. The gold coins are
 * shown apart.
 */
const HolderInventory: FC<{
  view: HolderView;
  /** An item changed: reload the holder (a character also reloads its equipment). */
  onChanged: (character?: Character) => void;
  equippedIds?: string[];
  /** Item id → equipment slot of a character, shown under the item name. */
  equippedSlots?: Record<string, string>;
  /** The item to highlight and the hover callback, to link the rows with the equipment slots. */
  highlightedId?: string;
  onHoverItem?: (itemId: string | undefined) => void;
  emptyAction?: React.ReactNode;
}> = ({ view, onChanged, equippedIds, equippedSlots, highlightedId, onHoverItem, emptyAction }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [operation, setOperation] = useState<{ kind: Operation; item: StrategicItem }>();
  const close = () => setOperation(undefined);
  const done = () => {
    close();
    onChanged();
  };

  /** The dialog keeps showing the changed item while the holder reloads. */
  const changed = (kind: Operation) => (item: StrategicItem) => {
    setOperation({ kind, item });
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
      ...(view.holder.kind === 'character' && isHealingHerb(item)
        ? [{ key: 'use-herb', label: t('use'), icon: <SpaIcon fontSize="small" />, onClick: open('use-herb') }]
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
      ...(item.weapon
        ? [
            {
              key: 'coat',
              label: t(item.coating ? 'remove-coating' : 'apply-poison'),
              icon: <ScienceIcon fontSize="small" />,
              onClick: open('coat'),
            },
          ]
        : []),
      // Spec 064 and 067: the enchantment of an item and its charges
      ...(item.enchantment || item.charges
        ? [
            {
              key: 'magic',
              label: t(
                item.enchantment && (!item.enchantment.source || item.enchantment.source === 'alchemy')
                  ? 'item-enchantment'
                  : 'item-magic'
              ),
              icon: <AutoAwesomeIcon fontSize="small" />,
              onClick: open('magic'),
            },
          ]
        : []),
      // Spec 067: the traits and the modern cut of a gem, and the gems set in any other item
      ...(isGem(item)
        ? [{ key: 'gem', label: t('gem-traits'), icon: <DiamondIcon fontSize="small" />, onClick: open('gem') }]
        : []),
      ...(isUncutGem(item)
        ? [{ key: 'cut', label: t('gem-cut-action'), icon: <ContentCutIcon fontSize="small" />, onClick: open('cut') }]
        : []),
      ...(!isGem(item) && ((item.settings?.length ?? 0) > 0 || settableGems(view, item).length > 0)
        ? [
            {
              key: 'settings',
              label: t(item.settings?.length ? 'gem-settings' : 'gem-set'),
              icon: <DiamondIcon fontSize="small" />,
              onClick: open('settings'),
            },
          ]
        : []),
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
        equippedSlots={equippedSlots}
        highlightedId={highlightedId}
        onHoverItem={onHoverItem}
        groupings={view.holder.kind === 'character' ? ['carried', 'category'] : ['category']}
        hideItemTypeIds={[GOLD_COIN]}
        emptyTitle={view.holder.kind === 'faction' ? t('armory-empty') : undefined}
        emptyAction={emptyAction}
      />
      {props && operation?.kind === 'sell' && <SellItemDialog {...props} />}
      {props && operation?.kind === 'transfer' && <TransferItemDialog {...props} />}
      {props && operation?.kind === 'repair' && <RepairItemDialog {...props} />}
      {props && operation?.kind === 'coat' && <CoatItemDialog {...props} />}
      {props && operation?.kind === 'discard' && <DiscardItemDialog {...props} />}
      {operation?.kind === 'use-herb' && (
        <UseHerbDialog characterId={view.holder.id} open item={operation.item} onClose={close} onDone={() => done()} />
      )}
      {operation?.kind === 'modifiers' && (
        <CharacterItemModifiersDialog
          open
          item={operation.item}
          onClose={() => done()}
          onChange={(item) => setOperation({ kind: 'modifiers', item })}
        />
      )}
      {operation?.kind === 'magic' && (
        <ItemMagicDialog item={operation.item} onClose={close} onChange={changed('magic')} />
      )}
      {operation?.kind === 'gem' && <GemDialog item={operation.item} onClose={close} />}
      {operation?.kind === 'cut' && <CutGemDialog item={operation.item} onClose={close} onChange={() => done()} />}
      {operation?.kind === 'settings' && (
        <GemSettingsDialog item={operation.item} view={view} onClose={close} onChange={changed('settings')} />
      )}
      {operation?.kind === 'history' && (
        <RmuDialog open maxWidth="md" title={t('item-history', { name: operation.item.name })} onClose={close}>
          <ItemLedgerList rsql={`itemIds==${operation.item.id}`} names={holderNames(view)} />
        </RmuDialog>
      )}
    </>
  );
};

export default HolderInventory;
