import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Stack, Typography } from '@mui/material';
import {
  characterOption,
  CharacterPicker,
  ItemConditionChip,
  ItemOperationResult,
  MoneyDisplay,
  NumericInput,
  repairItem,
  RmuDialog,
  StrategicItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useBusyAction } from '../shared/useBusyAction';
import ItemLedgerOutcome from './ItemLedgerOutcome';
import ManeuverFields, { defaultSkillKey, emptyManeuver, isManeuverReady, toManeuverDto } from './ManeuverFields';
import { CRAFT_SKILLS, DialogProps } from './item-operation-common';

/** Penalty of a repair roll: the damage of the item, or −100 when it is broken. */
const repairPenalty = (item: StrategicItem) => (item.condition?.broken ? -100 : (item.condition?.breakagePenalty ?? 0));

/**
 * Repairs a damaged or broken item (decision 11): a craftsman of the faction rolls with the damage of the item as a
 * penalty, and the outcome of the repair table changes its breakage. The cost is optional.
 */
export const RepairItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const craftsmen = view.members;
  const [actorId, setActorId] = useState(view.character?.id ?? craftsmen[0]?.id ?? '');
  const actor = craftsmen.find((member) => member.id === actorId) ?? view.character;
  const [maneuver, setManeuver] = useState(emptyManeuver(defaultSkillKey(actor, CRAFT_SKILLS), 'm'));
  const [cost, setCost] = useState<number | null>(null);
  const { busy, run } = useBusyAction();
  const [result, setResult] = useState<ItemOperationResult>();

  const onRepair = () => {
    run(
      repairItem(
        item.id,
        { maneuver: { ...toManeuverDto(maneuver), ...(actorId ? { actorId } : {}) }, ...(cost ? { cost } : {}) },
        auth
      ),
      setResult
    );
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
