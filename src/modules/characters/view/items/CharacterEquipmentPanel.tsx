import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Stack } from '@mui/material';
import {
  Character,
  EquipmentSlot,
  fetchCharacter,
  LoadingState,
  Panel,
  StrategicGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import HolderInventory, { holderNames } from '../../../economy/HolderInventory';
import { CreateMagicItemButton } from '../../../economy/HolderMagicButtons';
import ItemLedgerList from '../../../economy/ItemLedgerList';
import { useHolder } from '../../../economy/use-holder';
import { canChangeCharacter } from '../../../shared/permissions';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';
import { EquipmentSlots } from './CharacterEquipmentSlots';
import { StatsPanel } from './CharacterEquipmentStats';
import CharacterViewTransferGold from './CharacterViewTransferGold';

export default function CharacterEquipmentPanel({
  character,
  setCharacter,
  strategicGame,
  refreshKey = 0,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
  /** Changes when something outside the panel (a treasure) changed the items of the character. */
  refreshKey?: number;
}) {
  const auth = useAuth();
  const notify = useApiNotify();
  const { t } = useTranslation();
  const { view, refresh } = useHolder('character', character.id);
  const items = view?.items ?? [];
  const [dialogEquipSlot, setDialogEquipSlot] = useState<EquipmentSlot>();
  // The item under the pointer, in a slot or in the inventory: both sides highlight it
  const [hoveredId, setHoveredId] = useState<string>();
  const slots = character.equipment.slots;
  const equippedIds = Object.values(slots).filter((id): id is string => !!id);
  const equippedSlots = Object.fromEntries(
    Object.entries(slots)
      .filter((entry): entry is [string, string] => !!entry[1])
      .map(([slot, id]) => [id, slot])
  );

  /** An operation changes the weight, the gold or the equipment of the character: the API reprocesses it. */
  const onChanged = (updated?: Character) => {
    refresh();
    if (updated) return setCharacter(updated);
    fetchCharacter(character.id, auth)
      .then((response) => setCharacter(response))
      .catch((err) => notify.error(err));
  };

  // A new refresh key (not the first render) reloads the items and the character
  const lastRefreshKey = useRef(refreshKey);
  useEffect(() => {
    if (lastRefreshKey.current === refreshKey) return;
    lastRefreshKey.current = refreshKey;
    onChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const canManage = canChangeCharacter(auth, character, strategicGame);

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '380px minmax(0, 1fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <EquipmentSlots
              character={character}
              items={items}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(slot) => setDialogEquipSlot(slot)}
            />
            <StatsPanel character={character} />
          </Stack>
          <Panel
            variant="outlined"
            title={t('inventory')}
            sx={{ minWidth: 0 }}
            extra={
              canManage && (
                <CreateMagicItemButton
                  size="small"
                  holder={{ kind: 'character', id: character.id }}
                  gameId={character.gameId}
                  onChanged={() => onChanged()}
                />
              )
            }
          >
            {view ? (
              <HolderInventory
                view={view}
                onChanged={onChanged}
                equippedIds={equippedIds}
                equippedSlots={equippedSlots}
                highlightedId={hoveredId}
                onHoverItem={setHoveredId}
              />
            ) : (
              <LoadingState />
            )}
          </Panel>
        </Box>
        {dialogEquipSlot && (
          <CharacterEquipmentDialog
            open
            character={character}
            items={items}
            slot={dialogEquipSlot}
            onClose={() => setDialogEquipSlot(undefined)}
            onEquip={(updated) => onChanged(updated)}
          />
        )}
      </Box>
      {view && <CharacterViewTransferGold character={character} view={view} onChanged={onChanged} />}
      {view && (
        <Panel variant="outlined" title={t('history')} sx={{ mt: 2 }}>
          <ItemLedgerList
            rsql={`holderIds==${character.id}`}
            perspective={view.holder}
            names={holderNames(view)}
            refreshKey={view}
          />
        </Panel>
      )}
    </>
  );
}
