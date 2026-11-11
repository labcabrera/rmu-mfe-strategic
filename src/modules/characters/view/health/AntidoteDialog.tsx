/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { MenuItem, TextField } from '@mui/material';
import {
  AntidoteFields,
  AntidoteFieldsValue,
  antidoteDto,
  Character,
  EMPTY_ANTIDOTE_FIELDS,
  EmptyState,
  fetchStrategicItems,
  GiveAntidoteDto,
  giveCharacterAntidote,
  Injury,
  RmuDialog,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { useBusyAction } from '../../../shared/useBusyAction';

/**
 * Gives an antidote for a poisoning (spec 042): an antidote the character carries (one dose is spent), a spell, or
 * one given by hand. The server tells whether it neutralized the poison.
 */
const AntidoteDialog: FC<{
  character: Character;
  injury?: Injury;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}> = ({ character, injury, open, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const [fields, setFields] = useState<AntidoteFieldsValue>(EMPTY_ANTIDOTE_FIELDS);
  const [itemId, setItemId] = useState('');
  const { busy: saving, run } = useBusyAction();

  useEffect(() => {
    if (!open) return;
    setFields(EMPTY_ANTIDOTE_FIELDS);
    setItemId('');
  }, [open]);

  const antidotesQuery = useQuery({
    // With `open` in the key each opening reads them again
    queryKey: ['character-antidotes', character.id, open],
    queryFn: () =>
      fetchStrategicItems(`characterId==${character.id}`, 0, 1000, auth).then((page) =>
        page.content.filter((item) => item.catalog?.features?.antidote)
      ),
    enabled: open,
    gcTime: 0,
  });
  const antidotes = antidotesQuery.data ?? [];

  useEffect(() => {
    if (antidotesQuery.error) notify.error(antidotesQuery.error);
  }, [antidotesQuery.error]);

  const dto = (): GiveAntidoteDto | undefined => antidoteDto(fields, itemId ? { source: 'item', itemId } : undefined);

  const save = () => {
    const body = dto();
    if (!injury || !body) return;
    run(giveCharacterAntidote(character.id, injury.id, body, auth), (result) => {
      onUpdated(result.character);
      if (result.neutralized) notify.success(t('antidote-neutralized'));
      else notify.warning(t('antidote-not-neutralized'));
      onClose();
    });
  };

  return (
    <RmuDialog
      open={open}
      title={t('give-antidote')}
      subtitle={injury?.poison?.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || !dto()}
    >
      <AntidoteFields
        value={fields}
        onChange={(patch) => setFields((current) => ({ ...current, ...patch }))}
        itemField={
          antidotes.length === 0 ? (
            <EmptyState dense title={t('antidote-no-items')} />
          ) : (
            <TextField
              select
              size="small"
              label={t('antidote')}
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              {antidotes.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {`${t(item.name, item.name)} (${item.amount})`}
                </MenuItem>
              ))}
            </TextField>
          )
        }
      />
    </RmuDialog>
  );
};

export default AntidoteDialog;
