import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Box, Button, Stack } from '@mui/material';
import { Faction, LoadingState, Panel, span } from '@labcabrera-rmu/rmu-react-shared-lib';
import HolderInventory, { holderNames } from '../../economy/HolderInventory';
import { CreateMagicItemButton, HolderTreasureButton } from '../../economy/HolderMagicButtons';
import ItemLedgerList from '../../economy/ItemLedgerList';
import { holderPath, useHolder } from '../../economy/use-holder';

/**
 * The armory of a faction (spec 023): the items the faction holds, with the same operations as the equipment of a
 * character, its market and workshop, and the ledger. Its players and the masters use its gold, market and workshop
 * (spec 072); only the masters roll a random treasure for it and create magic items in it (spec 067).
 */
export default function FactionViewArmory({
  faction,
  gameMaster,
  canWrite,
  onGoldChanged,
}: {
  faction: Faction;
  gameMaster: boolean;
  /** Spec 072: the masters and the players of the faction use its market, workshop and enchantments. */
  canWrite: boolean;
  onGoldChanged: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { view, refresh } = useHolder('faction', faction.id);
  const holder = { kind: 'faction' as const, id: faction.id };
  const onChanged = () => {
    refresh();
    onGoldChanged();
  };
  const links = canWrite && (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <Button size="small" startIcon={<StorefrontIcon />} onClick={() => navigate(holderPath('market', holder))}>
        {t('market')}
      </Button>
      <Button size="small" startIcon={<BuildIcon />} onClick={() => navigate(holderPath('workshop', holder))}>
        {t('workshop')}
      </Button>
      <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={() => navigate(holderPath('enchantments', holder))}>
        {t('enchantments')}
      </Button>
      {gameMaster && (
        <>
          <HolderTreasureButton size="small" holder={holder} gameId={faction.gameId} onChanged={onChanged} />
          <CreateMagicItemButton size="small" holder={holder} gameId={faction.gameId} onChanged={onChanged} />
        </>
      )}
    </Stack>
  );
  return (
    <>
      <Box sx={span(12, 7)}>
        <Panel title={t('armory')} extra={links}>
          {view ? <HolderInventory view={view} onChanged={onChanged} /> : <LoadingState />}
        </Panel>
      </Box>
      <Box sx={span(12, 5)}>
        <Panel title={t('history')}>
          {view ? (
            <ItemLedgerList
              rsql={`holderIds==${faction.id}`}
              perspective={holder}
              names={holderNames(view)}
              refreshKey={view}
            />
          ) : (
            <LoadingState />
          )}
        </Panel>
      </Box>
    </>
  );
}
