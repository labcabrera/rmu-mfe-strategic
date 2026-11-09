import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack } from '@mui/material';
import {
  Character,
  FlowSteps,
  HealerCandidate,
  HealerPicker,
  Injury,
  InjuryCard,
  RmuDialog,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import HealingRecoveryStep from './HealingRecoveryStep';
import HealingTreatmentStep from './HealingTreatmentStep';
import { HealingStepId, InjuryHealing, useInjuryHealing } from './use-injury-healing';

const STEPS: HealingStepId[] = ['healer', 'treatment', 'recovery'];

interface DialogProps {
  character: Character;
  injuryId?: string;
  /** Characters of the strategic game that can heal, the character itself included. */
  healers: HealerCandidate[];
  /** Own injury penalties of the healer characters by id, which the API adds to their Medicine roll (spec 022). */
  healerPenalties?: Record<string, number>;
  open: boolean;
  initialStep?: HealingStepId;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}

const HealingHealerStep: FC<{ character: Character; healers: HealerCandidate[]; healing: InjuryHealing }> = ({
  character,
  healers,
  healing,
}) => {
  const { t } = useTranslation();
  const { form, update, resolvedHealer } = healing;
  return (
    <Stack spacing={2}>
      <HealerPicker
        characters={healers}
        selfId={character.id}
        value={form.healer}
        onChange={(healer) => update({ healer })}
      />
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={() => update({ step: 'recovery' })}>{t('healing-step-recovery')}</Button>
        <Button variant="contained" disabled={!resolvedHealer} onClick={() => update({ step: 'treatment' })}>
          {t('next')}
        </Button>
      </Stack>
    </Stack>
  );
};

const InjuryHealingFlow: FC<Omit<DialogProps, 'injuryId'> & { injury: Injury }> = ({
  character,
  injury,
  healers,
  healerPenalties = {},
  open,
  initialStep = 'healer',
  onClose,
  onUpdated,
}) => {
  const { t } = useTranslation();
  const healing = useInjuryHealing({ character, injury, healers, healerPenalties, open, initialStep, onUpdated });
  const { form, update, resolvedHealer } = healing;

  const content: Record<HealingStepId, ReactNode> = {
    healer: <HealingHealerStep character={character} healers={healers} healing={healing} />,
    treatment: <HealingTreatmentStep healing={healing} />,
    recovery: <HealingRecoveryStep healing={healing} />,
  };

  return (
    <RmuDialog open={open} title={t('heal-injury')} subtitle={character.name} maxWidth="md" onClose={onClose}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <InjuryCard injury={injury} dense />
        <Box sx={{ mx: -2 }}>
          <FlowSteps
            activeIndex={STEPS.indexOf(form.step)}
            onReview={(id) => id && update({ step: id as HealingStepId })}
            steps={STEPS.map((id) => ({
              id,
              label: t(`healing-step-${id}`),
              summary: id === 'healer' ? resolvedHealer?.name : undefined,
              content: content[id],
            }))}
          />
        </Box>
      </Stack>
    </RmuDialog>
  );
};

/**
 * Healing of one injury in three steps that can be done apart (spec 013 §6.3): the healer, the treatment (Medicine
 * maneuver) and the recovery roll, with the permanent injury roll when the recovery asks for it.
 */
const InjuryHealingDialog: FC<DialogProps> = ({ injuryId, ...props }) => {
  const injury = (props.character.injuries || []).find((item) => item.id === injuryId);
  if (!injury) return null;
  return <InjuryHealingFlow {...props} injury={injury} />;
};

export type { HealingStepId };
export default InjuryHealingDialog;
