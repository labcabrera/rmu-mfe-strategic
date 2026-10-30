import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import {
  Faction,
  FactionNpcInput,
  NpcEntry,
  NpcEntryDialog,
  NpcEntryList,
  Panel,
  StrategicGame,
  updateFactionNpcs,
  useCampaignNpcs,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { span } from '../../shared/layout/Bento';

/**
 * The NPCs of a faction (spec 055): guards, mercenaries, mounts… with their alias, specimens and notes. They can be
 * NPCs of the campaign's realm or of a generic realm. Every change saves the whole list in one PATCH; the API checks
 * each NPC and its errors are shown as usual. Only who can change the faction (the game master) sees the buttons.
 */
export default function FactionViewNpcs({
  faction,
  game,
  canEdit,
  onChanged,
}: {
  faction: Faction;
  game: StrategicGame | undefined;
  canEdit: boolean;
  onChanged: (faction: Faction) => void;
}) {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useNotify();
  const npcs = useCampaignNpcs(game?.realmId);
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const entries = faction.npcs ?? [];

  const save = (next: FactionNpcInput[]) => {
    setSaving(true);
    updateFactionNpcs(faction.id, next, auth)
      .then((updated) => {
        onChanged(updated);
        setEditing(null);
      })
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  const onSave = (entry: NpcEntry) => {
    const input: FactionNpcInput = { ...entry, notes: entry.notes ?? null };
    if (editing === 'new') save([...entries, input]);
    else if (typeof editing === 'number')
      save(entries.map((each, index) => (index === editing ? { ...input, id: each.id } : each)));
  };

  return (
    <Box sx={span(12, 12)}>
      <Panel
        title={t('npcs')}
        extra={
          canEdit && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {saving && <CircularProgress size={18} />}
              <Button size="small" startIcon={<AddIcon />} disabled={saving} onClick={() => setEditing('new')}>
                {t('add-npc')}
              </Button>
            </Stack>
          )
        }
      >
        <NpcEntryList
          entries={entries}
          npcs={npcs}
          disabled={saving}
          emptyText={t('faction-npcs-empty')}
          onEdit={canEdit ? setEditing : undefined}
          onRemove={canEdit ? (index) => save(entries.filter((_, each) => each !== index)) : undefined}
        />
      </Panel>
      <NpcEntryDialog
        open={editing !== null}
        title={editing === 'new' ? t('add-npc') : t('edit-npc')}
        npcs={npcs}
        entry={typeof editing === 'number' ? entries[editing] : undefined}
        withNotes
        onSave={onSave}
        onClose={() => setEditing(null)}
      />
    </Box>
  );
}
