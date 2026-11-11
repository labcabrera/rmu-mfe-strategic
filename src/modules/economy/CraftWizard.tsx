import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography } from '@mui/material';
import { FlowSteps, ItemThumb, MoneyDisplay, Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import CraftCraftsmanStep from './CraftCraftsmanStep';
import CraftEnhancementsStep from './CraftEnhancementsStep';
import CraftQualityStep from './CraftQualityStep';
import CraftRollStep from './CraftRollStep';
import CraftTypeStep from './CraftTypeStep';
import ItemLedgerOutcome from './ItemLedgerOutcome';
import { CRAFT_STEPS, useCraftWizard } from './use-craft-wizard';
import { HolderView } from './use-holder';

/** The craft wizard of a holder: item, craftsman, quality, enhancements and the roll (specs 023 and 043). */
const CraftWizard: FC<{ view: HolderView; onDone: () => void }> = ({ view, onDone }) => {
  const { t } = useTranslation();
  const wizard = useCraftWizard(view, onDone);
  const { form, update, busy, result, kind, blunt, plan, planError, materialList, materialsError, cost, canNext } =
    wizard;
  const { step, itemType, name, payer, quality } = form;

  if (result) {
    return (
      <Panel variant="outlined">
        <ItemLedgerOutcome entry={result.entry} item={result.item} />
        <Button sx={{ mt: 2 }} variant="contained" onClick={wizard.reset}>
          {t('craft-another')}
        </Button>
      </Panel>
    );
  }

  const stepContent = [
    <CraftTypeStep wizard={wizard} />,
    <CraftCraftsmanStep wizard={wizard} view={view} />,
    itemType ? (
      <CraftQualityStep
        kind={kind}
        blunt={blunt}
        materials={materialList}
        materialsError={materialsError}
        value={quality}
        onChange={(value) => update({ quality: value })}
        plan={plan}
        planError={planError}
        free={payer === 'free'}
      />
    ) : undefined,
    <CraftEnhancementsStep wizard={wizard} />,
    <CraftRollStep wizard={wizard} />,
  ];

  return (
    <Stack spacing={2}>
      {itemType && step > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ItemThumb item={itemType} size={48} />
          <Stack>
            <Typography sx={{ fontWeight: 600 }}>{name.trim() || t(itemType.name, itemType.name)}</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {t('craft-cost')}
              </Typography>
              <MoneyDisplay gold={payer === 'free' ? 0 : cost} variant="caption" />
              {(plan?.productionHours ?? itemType.info.productionHours) !== null && (
                <Typography variant="caption" color="text.secondary">
                  {t('production-hours-value', { hours: plan?.productionHours ?? itemType.info.productionHours })}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
      <FlowSteps
        activeIndex={step}
        onReview={(id) => id && !busy && update({ step: CRAFT_STEPS.indexOf(id) })}
        steps={CRAFT_STEPS.map((label, index) => ({
          id: label,
          label: t(label),
          summary: index === 0 && itemType ? t(itemType.name, itemType.name) : undefined,
          content: stepContent[index],
        }))}
        footer={
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
            <Button disabled={step === 0} onClick={() => update({ step: step - 1 })}>
              {t('back')}
            </Button>
            {step < CRAFT_STEPS.length - 1 ? (
              step > 0 && (
                <Button variant="contained" disabled={!canNext} onClick={() => update({ step: step + 1 })}>
                  {t('next')}
                </Button>
              )
            ) : (
              <Button variant="contained" disabled={!canNext} onClick={wizard.craft}>
                {t('craft')}
              </Button>
            )}
          </Stack>
        }
      />
    </Stack>
  );
};

export default CraftWizard;
