/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  applyCharacterHerb,
  EmptyState,
  fetchStrategicItems,
  HerbUseFields,
  isHealingHerb,
  RmuDialog,
  StrategicItem,
  useApiNotify,
  UseHerbResult,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { useBusyAction } from '../shared/useBusyAction';

/**
 * A dose of a healing herb of the character (spec 062): the hits rolled (or the server rolls the range of the herb),
 * one dose spent and an entry in the healing log. `item` opens it on that herb; without it, it lists the herbs that
 * heal.
 */
const UseHerbDialog: FC<{
  characterId: string;
  open: boolean;
  item?: StrategicItem;
  onClose: () => void;
  onDone: (result: UseHerbResult) => void;
}> = ({ characterId, open, item, onClose, onDone }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const [itemId, setItemId] = useState(item?.id ?? '');
  const [roll, setRoll] = useState<number | null>(null);
  const { busy: saving, run } = useBusyAction();

  useEffect(() => {
    if (!open) return;
    setRoll(null);
    setItemId(item?.id ?? '');
  }, [open, item?.id]);

  const herbsQuery = useQuery({
    // With `open` in the key each opening reads them again
    queryKey: ['character-healing-herbs', characterId, open],
    queryFn: () =>
      fetchStrategicItems(`characterId==${characterId}`, 0, 1000, auth).then((page) =>
        page.content.filter(isHealingHerb)
      ),
    enabled: open && !item,
    gcTime: 0,
  });
  const herbs = item ? [item] : (herbsQuery.data ?? []);

  useEffect(() => {
    if (herbsQuery.error) notify.error(herbsQuery.error);
  }, [herbsQuery.error]);

  const selected = herbs.find((each) => each.id === itemId);
  const heal = selected?.catalog?.features?.herb?.effects?.heal;

  const save = () => {
    if (!selected) return;
    run(
      applyCharacterHerb(characterId, { itemId: selected.id, ...(roll !== null ? { roll } : {}) }, auth),
      (result) => {
        notify.success(t('herb-use-done', { hits: result.healed }));
        onDone(result);
      }
    );
  };

  return (
    <RmuDialog
      open={open}
      title={t('herb-use')}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || !selected}
    >
      <HerbUseFields
        herbs={herbs}
        itemId={itemId}
        onItemChange={setItemId}
        itemDisabled={!!item}
        empty={<EmptyState dense title={t('herb-use-no-items')} />}
        heal={heal}
        roll={roll}
        onRollChange={setRoll}
      />
    </RmuDialog>
  );
};

export default UseHerbDialog;
