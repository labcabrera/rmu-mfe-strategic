import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Box, Button, Stack } from '@mui/material';
import { Faction, LoadingState, Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import HolderInventory, { holderNames } from '../../economy/HolderInventory';
import ItemLedgerList from '../../economy/ItemLedgerList';
import { holderPath, useHolder } from '../../economy/use-holder';
import { span } from '../../shared/layout/Bento';

/**
 * The armory of a faction (spec 023): the items the faction holds, with the same operations as the equipment of a
 * character, its market and workshop, and the ledger. Only the game master spends the gold of the faction.
 */
export default function FactionViewArmory({ faction, onGoldChanged }: { faction: Faction; onGoldChanged: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { view, refresh } = useHolder('faction', faction.id);
  const holder = { kind: 'faction' as const, id: faction.id };
  const onChanged = () => {
    refresh();
    onGoldChanged();
  };
  const links = (
    <Stack direction="row" spacing={1}>
      <Button size="small" startIcon={<StorefrontIcon />} onClick={() => navigate(holderPath('market', holder))}>
        {t('market')}
      </Button>
      <Button size="small" startIcon={<BuildIcon />} onClick={() => navigate(holderPath('workshop', holder))}>
        {t('workshop')}
      </Button>
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
